import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateQuoteDto } from '../dto/create-quote.dto';
import {
  FeeMode,
  MatchedQuoteConfig,
  MaterialPriceConfig,
  PrintPriceConfig,
  ProcessPriceConfig,
  ProductTemplateConfig,
  RuleConfig,
} from '../interfaces/pricing-config.interface';
import { PrismaService } from '../../../database/prisma.service';

const fallbackTemplates: ProductTemplateConfig[] = [
  {
    id: 1,
    productId: 1,
    widthMin: 20,
    widthMax: 500,
    heightMin: 20,
    heightMax: 500,
    quantityMin: 100,
    quantityMax: 100000,
    materialIds: [1, 2, 3],
    processCodes: ['lamination', 'die_cut', 'uv', 'proofing'],
    printModes: ['four_color', 'single_color'],
    shapeTypes: ['rectangle', 'custom'],
    allowProofing: true,
  },
];

const fallbackMaterialPrices: MaterialPriceConfig[] = [
  { materialId: 1, materialName: '铜版纸', unitPrice: 0.8 },
  { materialId: 2, materialName: '透明 PET', unitPrice: 1.5 },
  { materialId: 3, materialName: '覆膜材料', unitPrice: 0.25 },
];

const fallbackPrintPrices: PrintPriceConfig[] = [
  { printMode: 'four_color', unitPrice: 0.03, setupFee: 50 },
  { printMode: 'single_color', unitPrice: 0.02, setupFee: 50 },
];

const fallbackProcessPrices: ProcessPriceConfig[] = [
  { code: 'lamination', name: '覆膜', feeMode: 'per_area', unitPrice: 0.2, setupFee: 0, minFee: 0 },
  {
    code: 'die_cut',
    name: '模切',
    feeMode: 'fixed_plus_qty',
    unitPrice: 0.01,
    setupFee: 80,
    minFee: 0,
  },
  { code: 'uv', name: 'UV', feeMode: 'per_area', unitPrice: 0.3, setupFee: 0, minFee: 0 },
  { code: 'proofing', name: '打样', feeMode: 'fixed', unitPrice: 100, setupFee: 0, minFee: 0 },
];

@Injectable()
export class QuoteConfigRepository {
  private readonly logger = new Logger(QuoteConfigRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async getMatchedConfig(dto: CreateQuoteDto): Promise<MatchedQuoteConfig> {
    if (!process.env.DATABASE_URL) {
      return this.getFallbackConfig(dto);
    }

    try {
      return await this.getDatabaseConfig(dto);
    } catch (error) {
      this.logger.warn(`数据库报价配置读取失败，使用内存示例配置：${getErrorMessage(error)}`);
      return this.getFallbackConfig(dto);
    }
  }

  private async getDatabaseConfig(dto: CreateQuoteDto): Promise<MatchedQuoteConfig> {
    const template = await this.prisma.productTemplate.findFirst({
      where: {
        id: BigInt(dto.productTemplateId),
        productId: BigInt(dto.productId),
        status: 'active',
      },
      include: {
        options: true,
      },
    });

    if (!template) {
      throw new Error('报价模板不存在');
    }

    const material = await this.prisma.material.findFirst({
      where: { id: BigInt(dto.materialId), status: 'active' },
      include: {
        prices: {
          where: { isCurrent: true },
          orderBy: { effectiveFrom: 'desc' },
          take: 1,
        },
      },
    });

    if (!material || material.prices.length === 0) {
      throw new Error('材料价格不存在');
    }

    const print = await this.prisma.printPrice.findFirst({
      where: { printMode: dto.printMode, isCurrent: true },
      orderBy: { effectiveFrom: 'desc' },
    });

    if (!print) {
      throw new Error('印刷价格不存在');
    }

    const processes = await this.prisma.process.findMany({
      where: {
        code: { in: dto.processCodes },
        status: 'active',
      },
      include: {
        prices: {
          where: { isCurrent: true },
          orderBy: { effectiveFrom: 'desc' },
          take: 1,
        },
      },
    });

    if (processes.length !== dto.processCodes.length) {
      throw new Error('存在未配置的工艺');
    }

    const rule = await this.findRule(dto);

    return {
      template: {
        id: Number(template.id),
        productId: Number(template.productId),
        widthMin: decimalToNumber(template.widthMin),
        widthMax: decimalToNumber(template.widthMax),
        heightMin: decimalToNumber(template.heightMin),
        heightMax: decimalToNumber(template.heightMax),
        quantityMin: template.quantityMin,
        quantityMax: template.quantityMax,
        materialIds: optionValues(template.options, 'material').map(Number),
        processCodes: optionValues(template.options, 'process'),
        printModes: optionValues(template.options, 'print_mode'),
        shapeTypes: optionValues(template.options, 'shape'),
        allowProofing: template.allowProofing,
      },
      material: {
        materialId: Number(material.id),
        materialName: material.name,
        unitPrice: decimalToNumber(material.prices[0].unitPrice),
      },
      print: {
        printMode: print.printMode,
        unitPrice: decimalToNumber(print.unitPrice),
        setupFee: decimalToNumber(print.setupFee),
      },
      processes: dto.processCodes.map((code) => {
        const process = processes.find((item) => item.code === code);
        if (!process || process.prices.length === 0) {
          throw new Error(`工艺价格不存在：${code}`);
        }

        const price = process.prices[0];
        return {
          code: process.code,
          name: process.name,
          feeMode: price.feeMode as FeeMode,
          unitPrice: decimalToNumber(price.unitPrice),
          setupFee: decimalToNumber(price.setupFee),
          minFee: decimalToNumber(price.minFee),
        };
      }),
      rule,
    };
  }

  private async findRule(dto: CreateQuoteDto): Promise<RuleConfig> {
    const scene = dto.customerType === 'company' ? 'enterprise' : 'retail';
    const now = new Date();
    const ruleSet = await this.prisma.quoteRuleSet.findFirst({
      where: {
        productTemplateId: BigInt(dto.productTemplateId),
        scene,
        status: 'active',
        effectiveFrom: { lte: now },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: now } }],
      },
      orderBy: [{ priority: 'desc' }, { effectiveFrom: 'desc' }],
      include: {
        rules: {
          where: { enabled: true },
          orderBy: { id: 'asc' },
        },
      },
    });

    if (!ruleSet || ruleSet.rules.length === 0) {
      throw new Error('报价规则不存在');
    }

    const matchedRule = ruleSet.rules.find((rule) => matchCondition(rule.conditionJson, dto));
    if (!matchedRule) {
      throw new Error('没有匹配的报价规则');
    }

    const config = matchedRule.configJson as Prisma.JsonObject;

    return {
      ruleSetId: Number(ruleSet.id),
      versionNo: ruleSet.versionNo,
      lossRate: jsonNumber(config.lossRate, 1.08),
      profitRate: jsonNumber(config.profitRate, 1.35),
      memberRate: jsonNumber(config.memberRate, dto.customerType === 'company' ? 0.95 : 1),
      minPrice: jsonNumber(config.minPrice, 300),
      packageFee: jsonNumber(config.packageFee, 20),
      urgentFeeRate: jsonNumber(config.urgentFeeRate, 0.15),
    };
  }

  private getFallbackConfig(dto: CreateQuoteDto): MatchedQuoteConfig {
    const template = fallbackTemplates.find((item) => item.id === dto.productTemplateId);
    const material = fallbackMaterialPrices.find((item) => item.materialId === dto.materialId);
    const print = fallbackPrintPrices.find((item) => item.printMode === dto.printMode);
    const processes = dto.processCodes.map((code) => {
      const process = fallbackProcessPrices.find((item) => item.code === code);
      if (!process) {
        throw new Error(`工艺价格不存在：${code}`);
      }
      return process;
    });

    if (!template) {
      throw new Error('报价模板不存在');
    }
    if (!material) {
      throw new Error('材料价格不存在');
    }
    if (!print) {
      throw new Error('印刷价格不存在');
    }

    return {
      template,
      material,
      print,
      processes,
      rule: {
        ruleSetId: dto.customerType === 'company' ? 2 : 1,
        versionNo: dto.customerType === 'company' ? 'RULE-COMPANY-V1' : 'RULE-RETAIL-V1',
        lossRate: 1.08,
        profitRate: 1.35,
        memberRate: dto.customerType === 'company' ? 0.95 : 1,
        minPrice: 300,
        packageFee: 20,
        urgentFeeRate: 0.15,
      },
    };
  }
}

function optionValues(
  options: Array<{ optionType: string; optionValue: string }>,
  type: string,
): string[] {
  return options.filter((option) => option.optionType === type).map((option) => option.optionValue);
}

function decimalToNumber(value: Prisma.Decimal): number {
  return value.toNumber();
}

function jsonNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' ? value : fallback;
}

function matchCondition(conditionJson: Prisma.JsonValue, dto: CreateQuoteDto): boolean {
  const condition = conditionJson as Prisma.JsonObject;
  return (
    inRange(condition.quantityRange, dto.quantity) &&
    inRange(condition.widthRange, dto.widthMm) &&
    inRange(condition.heightRange, dto.heightMm) &&
    inList(condition.customerTypes, dto.customerType ?? 'personal')
  );
}

function inRange(value: unknown, current: number): boolean {
  if (!Array.isArray(value) || value.length < 2) {
    return true;
  }

  const [min, max] = value;
  return typeof min === 'number' && typeof max === 'number' ? current >= min && current <= max : true;
}

function inList(value: unknown, current: string): boolean {
  if (!Array.isArray(value) || value.length === 0) {
    return true;
  }

  return value.includes(current);
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
