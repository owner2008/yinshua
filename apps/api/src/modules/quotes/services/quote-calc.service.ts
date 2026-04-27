import { Injectable } from '@nestjs/common';
import { CreateQuoteDto } from '../dto/create-quote.dto';
import { MatchedQuoteConfig, ProcessPriceConfig, RuleConfig } from '../interfaces/pricing-config.interface';
import { QuoteResult } from '../interfaces/quote-result.interface';

@Injectable()
export class QuoteCalcService {
  calculate(dto: CreateQuoteDto, config: MatchedQuoteConfig): QuoteResult {
    const areaM2 = round(dto.widthMm * dto.heightMm / 1_000_000, 6);
    const materialCost = round(
      areaM2 * dto.quantity * config.material.unitPrice * config.rule.lossRate,
      2,
    );
    const printCost = round(dto.quantity * config.print.unitPrice + config.print.setupFee, 2);

    const processes = config.processes.map((process) => {
      const cost = this.calculateProcessCost(process, dto, areaM2);

      return {
        code: process.code,
        name: process.name,
        feeMode: process.feeMode,
        unitPrice: process.unitPrice,
        setupFee: process.setupFee,
        cost,
      };
    });

    const processCost = round(
      processes.reduce((total, process) => total + process.cost, 0),
      2,
    );

    const requirementFees = calculateRequirementFees(dto, areaM2, config.rule);
    const urgentFee = dto.isUrgent
      ? round((materialCost + printCost + processCost) * config.rule.urgentFeeRate, 2)
      : 0;
    const extraFees = [
      { code: 'package', name: '包装费', amount: config.rule.packageFee },
      ...requirementFees,
      ...(urgentFee > 0 ? [{ code: 'urgent', name: '加急费', amount: urgentFee }] : []),
    ];
    const extraFeeTotal = round(extraFees.reduce((total, fee) => total + fee.amount, 0), 2);
    const baseCost = round(materialCost + printCost + processCost + extraFeeTotal, 2);
    const salePrice = round(baseCost * config.rule.profitRate, 2);
    const memberPrice = round(salePrice * config.rule.memberRate, 2);
    const finalPrice = round(Math.max(memberPrice, config.rule.minPrice), 2);

    return {
      quoteNo: createQuoteNo(),
      productId: dto.productId,
      productTemplateId: dto.productTemplateId,
      dimensions: {
        widthMm: dto.widthMm,
        heightMm: dto.heightMm,
        areaM2,
      },
      quantity: dto.quantity,
      material: {
        materialId: dto.materialId,
        materialName: config.material.materialName,
        unitPrice: config.material.unitPrice,
        lossRate: config.rule.lossRate,
        cost: materialCost,
      },
      print: {
        printMode: dto.printMode,
        unitPrice: config.print.unitPrice,
        setupFee: config.print.setupFee,
        cost: printCost,
      },
      processes,
      extraFees,
      summary: {
        baseCost,
        profitRate: config.rule.profitRate,
        salePrice,
        memberRate: config.rule.memberRate,
        finalPrice,
        unitPrice: round(finalPrice / dto.quantity, 4),
        minPriceApplied: finalPrice === config.rule.minPrice && memberPrice < config.rule.minPrice,
      },
      snapshot: {
        input: dto as unknown as Record<string, unknown>,
        ruleSetId: config.rule.ruleSetId,
        ruleVersion: config.rule.versionNo,
        pricing: {
          material: config.material,
          print: config.print,
          processes: config.processes,
          rule: config.rule,
          requirementFees,
        },
        result: {
          baseCost,
          finalPrice,
        },
      },
    };
  }

  private calculateProcessCost(
    process: ProcessPriceConfig,
    dto: CreateQuoteDto,
    areaM2: number,
  ): number {
    const areaForSpecialProcess =
      process.code === 'uv' && dto.uvAreaMm2
        ? dto.uvAreaMm2 / 1_000_000
        : process.code === 'hot_stamp' && dto.hotStampAreaMm2
          ? dto.hotStampAreaMm2 / 1_000_000
          : areaM2;

    const rawCost = (() => {
      switch (process.feeMode) {
        case 'fixed':
          return process.unitPrice + process.setupFee;
        case 'per_area':
          return areaForSpecialProcess * dto.quantity * process.unitPrice + process.setupFee;
        case 'per_qty':
          return dto.quantity * process.unitPrice + process.setupFee;
        case 'fixed_plus_qty':
          return process.setupFee + dto.quantity * process.unitPrice;
        case 'fixed_plus_area':
          return process.setupFee + areaForSpecialProcess * dto.quantity * process.unitPrice;
      }
    })();

    return round(Math.max(rawCost, process.minFee), 2);
  }
}

function round(value: number, precision: number): number {
  const factor = 10 ** precision;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function calculateRequirementFees(dto: CreateQuoteDto, areaM2: number, rule: RuleConfig) {
  const fees: Array<{ code: string; name: string; amount: number }> = [];

  if (dto.colorMode?.includes('白墨')) {
    fees.push({
      code: 'white_ink',
      name: '白墨打底费',
      amount: round(
        Math.max(rule.whiteInkMinFee, areaM2 * dto.quantity * rule.whiteInkUnitPrice + rule.whiteInkSetupFee),
        2,
      ),
    });
  }

  if (dto.colorMode?.includes('可变数据')) {
    fees.push({
      code: 'variable_data',
      name: '可变数据费',
      amount: round(Math.max(rule.variableDataMinFee, dto.quantity * rule.variableDataUnitPrice), 2),
    });
  }

  if (dto.surfaceFinish && ['防刮', '防水'].some((keyword) => dto.surfaceFinish?.includes(keyword))) {
    fees.push({
      code: 'protective_finish',
      name: `${dto.surfaceFinish}处理费`,
      amount: round(
        Math.max(rule.protectiveFinishMinFee, areaM2 * dto.quantity * rule.protectiveFinishUnitPrice),
        2,
      ),
    });
  }

  const rollCount = dto.deliveryForm === '卷装' && dto.piecesPerRoll ? Math.ceil(dto.quantity / dto.piecesPerRoll) : 0;
  if (rollCount > 1) {
    fees.push({
      code: 'roll_split',
      name: '分卷包装费',
      amount: round(rollCount * rule.rollSplitFeePerRoll, 2),
    });
  }

  if (dto.deliveryForm === '单张裁切') {
    fees.push({ code: 'sheet_cutting', name: '单张裁切整理费', amount: rule.sheetCuttingFee });
  }

  if (dto.deliveryForm === '折叠 / 风琴折') {
    fees.push({ code: 'fan_fold', name: '折叠整理费', amount: rule.fanFoldFee });
  }

  return fees;
}

function createQuoteNo(): string {
  const now = new Date();
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
    String(now.getSeconds()).padStart(2, '0'),
  ].join('');

  return `Q${stamp}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
}
