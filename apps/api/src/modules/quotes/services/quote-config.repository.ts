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
    materialIds: [1, 2],
    processCodes: ['lamination', 'die_cut', 'uv', 'proofing'],
    printModes: ['four_color', 'single_color'],
    shapeTypes: ['rectangle', 'custom'],
    allowProofing: true,
  },
  {
    id: 2,
    productId: 2,
    widthMin: 30,
    widthMax: 400,
    heightMin: 20,
    heightMax: 400,
    quantityMin: 500,
    quantityMax: 200000,
    materialIds: [1],
    processCodes: ['lamination', 'die_cut', 'proofing'],
    printModes: ['four_color', 'single_color'],
    shapeTypes: ['rectangle'],
    allowProofing: true,
  },
  {
    id: 3,
    productId: 3,
    widthMin: 40,
    widthMax: 300,
    heightMin: 30,
    heightMax: 300,
    quantityMin: 200,
    quantityMax: 50000,
    materialIds: [1, 2],
    processCodes: ['hot_stamp', 'die_cut', 'proofing'],
    printModes: ['four_color'],
    shapeTypes: ['rectangle', 'custom'],
    allowProofing: true,
  },
  {
    id: 4,
    productId: 4,
    widthMin: 30,
    widthMax: 200,
    heightMin: 30,
    heightMax: 200,
    quantityMin: 1000,
    quantityMax: 500000,
    materialIds: [4],
    processCodes: ['die_cut'],
    printModes: ['single_color'],
    shapeTypes: ['rectangle'],
    allowProofing: false,
  },
  {
    id: 5,
    productId: 5,
    widthMin: 30,
    widthMax: 450,
    heightMin: 20,
    heightMax: 450,
    quantityMin: 300,
    quantityMax: 100000,
    materialIds: [5],
    processCodes: ['lamination', 'die_cut', 'uv', 'proofing'],
    printModes: ['four_color'],
    shapeTypes: ['rectangle', 'custom'],
    allowProofing: true,
  },
  {
    id: 6,
    productId: 6,
    widthMin: 25,
    widthMax: 380,
    heightMin: 20,
    heightMax: 380,
    quantityMin: 500,
    quantityMax: 200000,
    materialIds: [1, 2],
    processCodes: ['lamination', 'die_cut', 'proofing'],
    printModes: ['four_color', 'single_color'],
    shapeTypes: ['rectangle', 'custom'],
    allowProofing: true,
  },
  {
    id: 7,
    productId: 7,
    widthMin: 20,
    widthMax: 360,
    heightMin: 20,
    heightMax: 360,
    quantityMin: 500,
    quantityMax: 150000,
    materialIds: [1, 2],
    processCodes: ['lamination', 'hot_stamp', 'uv', 'die_cut', 'proofing'],
    printModes: ['four_color'],
    shapeTypes: ['rectangle', 'custom'],
    allowProofing: true,
  },
  {
    id: 8,
    productId: 8,
    widthMin: 15,
    widthMax: 300,
    heightMin: 10,
    heightMax: 300,
    quantityMin: 300,
    quantityMax: 100000,
    materialIds: [2, 5],
    processCodes: ['lamination', 'die_cut', 'proofing'],
    printModes: ['four_color', 'single_color'],
    shapeTypes: ['rectangle', 'custom'],
    allowProofing: true,
  },
  {
    id: 9,
    productId: 9,
    widthMin: 20,
    widthMax: 320,
    heightMin: 15,
    heightMax: 320,
    quantityMin: 1000,
    quantityMax: 300000,
    materialIds: [1],
    processCodes: ['lamination', 'die_cut', 'proofing'],
    printModes: ['four_color', 'single_color'],
    shapeTypes: ['rectangle'],
    allowProofing: true,
  },
  {
    id: 10,
    productId: 10,
    widthMin: 15,
    widthMax: 260,
    heightMin: 10,
    heightMax: 260,
    quantityMin: 500,
    quantityMax: 100000,
    materialIds: [6],
    processCodes: ['die_cut', 'proofing'],
    printModes: ['four_color', 'single_color'],
    shapeTypes: ['rectangle', 'custom'],
    allowProofing: true,
  },
  {
    id: 11,
    productId: 11,
    widthMin: 20,
    widthMax: 500,
    heightMin: 15,
    heightMax: 220,
    quantityMin: 500,
    quantityMax: 200000,
    materialIds: [1, 2],
    processCodes: ['lamination', 'die_cut', 'proofing'],
    printModes: ['four_color'],
    shapeTypes: ['rectangle', 'custom'],
    allowProofing: true,
  },
  {
    id: 12,
    productId: 12,
    widthMin: 20,
    widthMax: 360,
    heightMin: 15,
    heightMax: 360,
    quantityMin: 500,
    quantityMax: 150000,
    materialIds: [7],
    processCodes: ['die_cut', 'proofing'],
    printModes: ['four_color', 'single_color'],
    shapeTypes: ['rectangle', 'custom'],
    allowProofing: true,
  },
];

const fallbackMaterialPrices: MaterialPriceConfig[] = [
  { materialId: 1, materialName: '铜版纸', unitPrice: 0.8 },
  { materialId: 2, materialName: '透明膜', unitPrice: 1.5 },
  { materialId: 3, materialName: '覆膜材料', unitPrice: 0.25 },
  { materialId: 4, materialName: '热敏纸', unitPrice: 0.9 },
  { materialId: 5, materialName: '合成纸', unitPrice: 1.2 },
  { materialId: 6, materialName: '易碎防伪纸', unitPrice: 1.8 },
  { materialId: 7, materialName: '可移除胶铜版纸', unitPrice: 1.1 },
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
  { code: 'uv', name: '局部光油', feeMode: 'per_area', unitPrice: 0.3, setupFee: 0, minFee: 0 },
  { code: 'proofing', name: '打样', feeMode: 'fixed', unitPrice: 100, setupFee: 0, minFee: 0 },
  {
    code: 'hot_stamp',
    name: '烫金',
    feeMode: 'per_area',
    unitPrice: 1.2,
    setupFee: 100,
    minFee: 50,
  },
];

const defaultRequirementFeeConfig = {
  whiteInkUnitPrice: 0.35,
  whiteInkSetupFee: 50,
  whiteInkMinFee: 80,
  variableDataUnitPrice: 0.006,
  variableDataMinFee: 80,
  protectiveFinishUnitPrice: 0.08,
  protectiveFinishMinFee: 30,
  rollSplitFeePerRoll: 2,
  sheetCuttingFee: 30,
  fanFoldFee: 50,
};

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
      ruleId: Number(matchedRule.id),
      versionNo: ruleSet.versionNo,
      lossRate: jsonNumber(config.lossRate, 1.08),
      profitRate: jsonNumber(config.profitRate, 1.35),
      memberRate: jsonNumber(config.memberRate, dto.customerType === 'company' ? 0.95 : 1),
      minPrice: jsonNumber(config.minPrice, 300),
      packageFee: jsonNumber(config.packageFee, 20),
      urgentFeeRate: jsonNumber(config.urgentFeeRate, 0.15),
      whiteInkUnitPrice: jsonNumber(config.whiteInkUnitPrice, defaultRequirementFeeConfig.whiteInkUnitPrice),
      whiteInkSetupFee: jsonNumber(config.whiteInkSetupFee, defaultRequirementFeeConfig.whiteInkSetupFee),
      whiteInkMinFee: jsonNumber(config.whiteInkMinFee, defaultRequirementFeeConfig.whiteInkMinFee),
      variableDataUnitPrice: jsonNumber(
        config.variableDataUnitPrice,
        defaultRequirementFeeConfig.variableDataUnitPrice,
      ),
      variableDataMinFee: jsonNumber(config.variableDataMinFee, defaultRequirementFeeConfig.variableDataMinFee),
      protectiveFinishUnitPrice: jsonNumber(
        config.protectiveFinishUnitPrice,
        defaultRequirementFeeConfig.protectiveFinishUnitPrice,
      ),
      protectiveFinishMinFee: jsonNumber(
        config.protectiveFinishMinFee,
        defaultRequirementFeeConfig.protectiveFinishMinFee,
      ),
      rollSplitFeePerRoll: jsonNumber(config.rollSplitFeePerRoll, defaultRequirementFeeConfig.rollSplitFeePerRoll),
      sheetCuttingFee: jsonNumber(config.sheetCuttingFee, defaultRequirementFeeConfig.sheetCuttingFee),
      fanFoldFee: jsonNumber(config.fanFoldFee, defaultRequirementFeeConfig.fanFoldFee),
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
        ruleId: dto.customerType === 'company' ? 2 : 1,
        versionNo: dto.customerType === 'company' ? 'RULE-COMPANY-V1' : 'RULE-RETAIL-V1',
        lossRate: 1.08,
        profitRate: 1.35,
        memberRate: dto.customerType === 'company' ? 0.95 : 1,
        minPrice: 300,
        packageFee: 20,
        urgentFeeRate: 0.15,
        ...defaultRequirementFeeConfig,
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
