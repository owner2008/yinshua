import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateQuoteDto } from '../dto/create-quote.dto';
import { QuoteResult, QuoteSnapshot } from '../interfaces/quote-result.interface';
import { PrismaService } from '../../../database/prisma.service';
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
  ) {}

  async calculate(dto: CreateQuoteDto): Promise<QuoteResult> {
    const config = await this.ruleMatcher.match(dto);
    this.validator.validate(dto, config.template);
    return this.calc.calculate(dto, config);
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
            processOptionsJson: jsonValue(dto.processCodes),
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

  if (fullResult?.quoteNo) {
    return fullResult;
  }

  return {
    quoteNo: quote.quoteNo,
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

function jsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}
