import { Injectable, Optional } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateQuoteDto } from '../dto/create-quote.dto';
import { UpdateQuoteStatusDto } from '../dto/update-quote-status.dto';
import { QuoteResult, QuoteSnapshot } from '../interfaces/quote-result.interface';
import { RuleConfig } from '../interfaces/pricing-config.interface';
import { PrismaService } from '../../../database/prisma.service';
import { AuditLogService } from '../../admin/services/audit-log.service';
import { QuoteCalcService } from './quote-calc.service';
import { QuoteRuleMatcherService } from './quote-rule-matcher.service';
import { QuoteSnapshotService } from './quote-snapshot.service';
import { QuoteValidatorService } from './quote-validator.service';

@Injectable()
export class QuoteService {
  private readonly quotes = new Map<string, QuoteResult>();

  constructor(
    private readonly ruleMatcher: QuoteRuleMatcherService,
    private readonly validator: QuoteValidatorService,
    private readonly calc: QuoteCalcService,
    private readonly snapshots: QuoteSnapshotService,
    private readonly prisma: PrismaService,
    @Optional() private readonly audit?: AuditLogService,
  ) {}

  async calculate(dto: CreateQuoteDto): Promise<QuoteResult> {
    const config = await this.ruleMatcher.match(dto);
    this.validator.validate(dto, config.template);
    return this.calc.calculate(dto, config);
  }

  async preview(dto: CreateQuoteDto): Promise<QuotePreviewResult> {
    const config = await this.ruleMatcher.match(dto);
    this.validator.validate(dto, config.template);
    const result = this.calc.calculate(dto, config);

    return {
      matchedRule: {
        ruleSetId: config.rule.ruleSetId,
        ruleId: config.rule.ruleId,
        versionNo: config.rule.versionNo,
        config: config.rule,
      },
      result,
    };
  }

  async create(dto: CreateQuoteDto, userId?: number): Promise<QuoteResult> {
    const result = await this.calculate(dto);
    this.quotes.set(result.quoteNo, structuredClone(result));
    this.snapshots.save(result.quoteNo, result.snapshot);

    if (process.env.DATABASE_URL) {
      await this.persist(result, dto, userId ?? dto.memberId);
    }

    return result;
  }

  async findAll(): Promise<QuoteResult[]> {
    if (process.env.DATABASE_URL) {
      try {
        const quotes = await this.prisma.quote.findMany({
          orderBy: { createdAt: 'desc' },
          include: { snapshot: true },
        });
        return quotes.map((quote) => quoteFromDatabase(quote));
      } catch {
        return this.findAllFromMemory();
      }
    }

    return this.findAllFromMemory();
  }

  async findOne(quoteNo: string): Promise<QuoteResult | undefined> {
    if (process.env.DATABASE_URL) {
      try {
        const quote = await this.prisma.quote.findUnique({
          where: { quoteNo },
          include: { snapshot: true },
        });
        return quote ? quoteFromDatabase(quote) : undefined;
      } catch {
        return this.findOneFromMemory(quoteNo);
      }
    }

    return this.findOneFromMemory(quoteNo);
  }

  async updateAdminStatus(quoteNo: string, dto: UpdateQuoteStatusDto): Promise<QuoteResult | undefined> {
    if (!process.env.DATABASE_URL) {
      const quote = this.quotes.get(quoteNo);
      if (!quote) {
        return undefined;
      }
      const followRemark = normalizeFollowRemark(dto.followRemark) ?? quote.followRemark;
      const updated = { ...quote, status: dto.status, followRemark };
      this.quotes.set(quoteNo, structuredClone(updated));
      return structuredClone(updated);
    }

    const before = await this.prisma.quote.findUnique({
      where: { quoteNo },
      include: { snapshot: true },
    });
    if (!before) {
      return undefined;
    }

    const beforeOptions = jsonObject(before.processOptionsJson);
    const nextOptions = {
      ...beforeOptions,
      followRemark: normalizeFollowRemark(dto.followRemark) ?? extractFollowRemark(beforeOptions),
    };
    const after = await this.prisma.quote.update({
      where: { quoteNo },
      data: {
        status: dto.status,
        processOptionsJson: jsonValue(nextOptions),
      },
      include: { snapshot: true },
    });

    await this.audit?.record({
      module: 'quote',
      action: 'follow_up',
      targetType: 'quote',
      targetId: before.id,
      before: {
        status: before.status,
        followRemark: extractFollowRemark(beforeOptions),
      },
      after: {
        status: after.status,
        followRemark: extractFollowRemark(nextOptions),
      },
    });

    return quoteFromDatabase(after);
  }

  private findAllFromMemory(): QuoteResult[] {
    return Array.from(this.quotes.values()).map((quote) => structuredClone(quote));
  }

  private findOneFromMemory(quoteNo: string): QuoteResult | undefined {
    const quote = this.quotes.get(quoteNo);
    return quote ? structuredClone(quote) : undefined;
  }

  private async persist(result: QuoteResult, dto: CreateQuoteDto, userId?: number): Promise<void> {
    try {
      await this.prisma.$transaction(async (tx) => {
        const quote = await tx.quote.create({
          data: {
            quoteNo: result.quoteNo,
            userId: userId ? BigInt(userId) : undefined,
            productId: BigInt(result.productId),
            productTemplateId: BigInt(result.productTemplateId),
            customerType: dto.customerType,
            width: new Prisma.Decimal(dto.widthMm),
            height: new Prisma.Decimal(dto.heightMm),
            quantity: dto.quantity,
            materialId: BigInt(dto.materialId),
            processOptionsJson: jsonValue({
              processCodes: dto.processCodes,
              requirements: pickQuoteRequirements(dto),
            }),
            priceSubtotal: new Prisma.Decimal(result.summary.baseCost),
            fixedFeeTotal: new Prisma.Decimal(
              result.extraFees.reduce((total, fee) => total + fee.amount, 0),
            ),
            discountTotal: new Prisma.Decimal(0),
            finalPrice: new Prisma.Decimal(result.summary.finalPrice),
            unitPrice: new Prisma.Decimal(result.summary.unitPrice),
            status: 'draft',
          },
        });

        await tx.quoteSnapshot.create({
          data: {
            quoteId: quote.id,
            ruleSetId: BigInt(result.snapshot.ruleSetId),
            ruleVersion: result.snapshot.ruleVersion,
            materialPriceSnapshotJson: jsonValue(result.snapshot.pricing.material),
            processPriceSnapshotJson: jsonValue(result.snapshot.pricing.processes),
            printPriceSnapshotJson: jsonValue(result.snapshot.pricing.print),
            formulaSnapshotJson: jsonValue({
              dimensions: result.dimensions,
              summary: result.summary,
            }),
            fullSnapshotJson: jsonValue(result),
          },
        });
      });
    } catch {
      // 数据库不可用时保留内存结果，保证开发期报价闭环不中断。
    }
  }
}

type QuoteWithSnapshot = Prisma.QuoteGetPayload<{ include: { snapshot: true } }>;

function quoteFromDatabase(quote: QuoteWithSnapshot): QuoteResult {
  const fullResult = quote.snapshot?.fullSnapshotJson as unknown as QuoteResult | undefined;
  const followRemark = extractFollowRemark(jsonObject(quote.processOptionsJson));

  if (fullResult?.quoteNo) {
    return {
      ...fullResult,
      status: quote.status,
      followRemark,
    };
  }

  return {
    quoteNo: quote.quoteNo,
    status: quote.status,
    followRemark,
    productId: Number(quote.productId),
    productTemplateId: Number(quote.productTemplateId),
    dimensions: {
      widthMm: quote.width.toNumber(),
      heightMm: quote.height.toNumber(),
      areaM2: 0,
    },
    quantity: quote.quantity,
    material: {
      materialId: Number(quote.materialId),
      materialName: '',
      unitPrice: 0,
      lossRate: 0,
      cost: 0,
    },
    print: {
      printMode: '',
      unitPrice: 0,
      setupFee: 0,
      cost: 0,
    },
    processes: [],
    extraFees: [],
    summary: {
      baseCost: quote.priceSubtotal.toNumber(),
      profitRate: 0,
      salePrice: 0,
      memberRate: 0,
      finalPrice: quote.finalPrice.toNumber(),
      unitPrice: quote.unitPrice.toNumber(),
      minPriceApplied: false,
    },
    snapshot:
      {
        input: {},
        ruleSetId: Number(quote.snapshot?.ruleSetId ?? 0),
        ruleVersion: quote.snapshot?.ruleVersion ?? '',
        pricing: {},
        result: {},
      },
  };
}

export interface QuotePreviewResult {
  matchedRule: {
    ruleSetId: number;
    ruleId?: number;
    versionNo: string;
    config: RuleConfig;
  };
  result: QuoteResult;
}

function jsonObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? { ...(value as Record<string, unknown>) }
    : {};
}

function extractFollowRemark(value: Record<string, unknown>): string | undefined {
  return typeof value.followRemark === 'string' && value.followRemark.trim()
    ? value.followRemark.trim()
    : undefined;
}

function normalizeFollowRemark(value: string | undefined): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function jsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function pickQuoteRequirements(dto: CreateQuoteDto) {
  return {
    deliveryForm: dto.deliveryForm,
    labelingMethod: dto.labelingMethod,
    rollDirection: dto.rollDirection,
    rollCoreMm: dto.rollCoreMm,
    piecesPerRoll: dto.piecesPerRoll,
    adhesiveType: dto.adhesiveType,
    usageEnvironment: dto.usageEnvironment,
    surfaceFinish: dto.surfaceFinish,
    colorMode: dto.colorMode,
    hasDesignFile: dto.hasDesignFile,
    designFileUrl: dto.designFileUrl,
    needDesignService: dto.needDesignService,
    needSampleApproval: dto.needSampleApproval,
    packagingMethod: dto.packagingMethod,
    expectedDeliveryDate: dto.expectedDeliveryDate,
    quoteRemark: dto.quoteRemark,
  };
}
