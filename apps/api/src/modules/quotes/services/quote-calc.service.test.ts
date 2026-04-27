import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CreateQuoteDto } from '../dto/create-quote.dto';
import { MatchedQuoteConfig } from '../interfaces/pricing-config.interface';
import { QuoteCalcService } from './quote-calc.service';

describe('QuoteCalcService', () => {
  it('calculates the documented PET label quote sample', () => {
    const service = new QuoteCalcService();
    const result = service.calculate(sampleInput, sampleConfig);

    assert.match(result.quoteNo, /^Q\d{17}$/);
    assert.equal(result.dimensions.areaM2, 0.008);
    assert.equal(result.material.cost, 64.8);
    assert.equal(result.print.cost, 200);
    assert.deepEqual(
      result.processes.map((item) => [item.code, item.cost]),
      [
        ['lamination', 8],
        ['die_cut', 130],
      ],
    );
    assert.equal(result.summary.baseCost, 422.8);
    assert.equal(result.summary.salePrice, 570.78);
    assert.equal(result.summary.finalPrice, 542.24);
    assert.equal(result.summary.unitPrice, 0.1084);
  });

  it('adds requirement-based extra fees without changing core process matching', () => {
    const service = new QuoteCalcService();
    const result = service.calculate(
      {
        ...sampleInput,
        colorMode: '四色 + 白墨',
        surfaceFinish: '防水',
        deliveryForm: '卷装',
        piecesPerRoll: 1000,
      },
      sampleConfig,
    );

    assert.deepEqual(
      result.extraFees.map((item) => [item.code, item.amount]),
      [
        ['package', 20],
        ['white_ink', 80],
        ['protective_finish', 30],
        ['roll_split', 10],
      ],
    );
    assert.equal(result.summary.baseCost, 542.8);
    assert.equal(result.summary.finalPrice, 696.14);
  });

  it('uses rule-configured requirement fee overrides', () => {
    const service = new QuoteCalcService();
    const result = service.calculate(
      {
        ...sampleInput,
        colorMode: '四色 + 白墨',
        surfaceFinish: '防水',
        deliveryForm: '卷装',
        piecesPerRoll: 1000,
      },
      {
        ...sampleConfig,
        rule: {
          ...sampleConfig.rule,
          whiteInkMinFee: 120,
          protectiveFinishMinFee: 45,
          rollSplitFeePerRoll: 3,
        },
      },
    );

    assert.deepEqual(
      result.extraFees.map((item) => [item.code, item.amount]),
      [
        ['package', 20],
        ['white_ink', 120],
        ['protective_finish', 45],
        ['roll_split', 15],
      ],
    );
    assert.equal(result.summary.baseCost, 602.8);
    assert.equal(result.summary.finalPrice, 773.09);
  });
});

const sampleInput: CreateQuoteDto = {
  productId: 1,
  productTemplateId: 1,
  widthMm: 100,
  heightMm: 80,
  quantity: 5000,
  materialId: 2,
  printMode: 'four_color',
  shapeType: 'rectangle',
  processCodes: ['lamination', 'die_cut'],
  isProofing: false,
  isUrgent: false,
  customerType: 'company',
};

const sampleConfig: MatchedQuoteConfig = {
  template: {
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
  material: {
    materialId: 2,
    materialName: '透明 PET',
    unitPrice: 1.5,
  },
  print: {
    printMode: 'four_color',
    unitPrice: 0.03,
    setupFee: 50,
  },
  processes: [
    {
      code: 'lamination',
      name: '覆膜',
      feeMode: 'per_area',
      unitPrice: 0.2,
      setupFee: 0,
      minFee: 0,
    },
    {
      code: 'die_cut',
      name: '模切',
      feeMode: 'fixed_plus_qty',
      unitPrice: 0.01,
      setupFee: 80,
      minFee: 0,
    },
  ],
  rule: {
    ruleSetId: 2,
    versionNo: 'RULE-COMPANY-V1',
    lossRate: 1.08,
    profitRate: 1.35,
    memberRate: 0.95,
    minPrice: 300,
    packageFee: 20,
    urgentFeeRate: 0.15,
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
  },
};
