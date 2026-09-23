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

  it('uses the selected dimensions, quantity, and material price without optional processes', () => {
    const result = new QuoteCalcService().calculate(
      {
        ...sampleInput,
        widthMm: 200,
        heightMm: 100,
        quantity: 10000,
        materialId: 3,
        processCodes: [],
      },
      {
        ...sampleConfig,
        material: { materialId: 3, materialName: '合成纸', unitPrice: 2 },
        print: { printMode: 'four_color', unitPrice: 0.02, setupFee: 30 },
        processes: [],
        rule: {
          ...sampleConfig.rule,
          lossRate: 1.1,
          profitRate: 1.2,
          memberRate: 1,
          minPrice: 0,
          packageFee: 0,
        },
      },
    );

    assert.equal(result.dimensions.areaM2, 0.02);
    assert.equal(result.material.cost, 440);
    assert.equal(result.print.cost, 230);
    assert.deepEqual(result.processes, []);
    assert.equal(result.summary.baseCost, 670);
    assert.equal(result.summary.finalPrice, 804);
  });

  it('applies the minimum charge after the member rate', () => {
    const result = new QuoteCalcService().calculate(sampleInput, {
      ...sampleConfig,
      rule: { ...sampleConfig.rule, minPrice: 600 },
    });

    assert.equal(result.summary.salePrice, 570.78);
    assert.equal(result.summary.finalPrice, 600);
    assert.equal(result.summary.unitPrice, 0.12);
    assert.equal(result.summary.minPriceApplied, true);
    assert.equal(result.snapshot.result.finalPrice, 600);
  });

  it('charges urgent production based on material, printing, and process costs', () => {
    const result = new QuoteCalcService().calculate({ ...sampleInput, isUrgent: true }, sampleConfig);

    assert.deepEqual(result.extraFees.map((fee) => [fee.code, fee.amount]), [
      ['package', 20],
      ['urgent', 60.42],
    ]);
    assert.equal(result.summary.baseCost, 483.22);
    assert.equal(result.summary.finalPrice, 619.73);
  });

  it('adds requirement-based extra fees without changing core process matching', () => {
    const service = new QuoteCalcService();
    const result = service.calculate(
      {
        ...sampleInput,
        colorMode: 'four_color_white_ink',
        surfaceFinish: 'waterproof',
        deliveryForm: 'roll',
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
        colorMode: 'four_color_white_ink',
        surfaceFinish: 'waterproof',
        deliveryForm: 'roll',
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

  it('adds style, design service, and sample approval fees from label requirements', () => {
    const service = new QuoteCalcService();
    const result = service.calculate(
      {
        ...sampleInput,
        styleCount: 3,
        needDesignService: true,
        needSampleApproval: true,
      },
      sampleConfig,
    );

    assert.deepEqual(
      result.extraFees.map((item) => [item.code, item.amount]),
      [
        ['package', 20],
        ['additional_style', 60],
        ['design_service', 120],
        ['sample_approval', 80],
      ],
    );
    assert.equal(result.summary.baseCost, 682.8);
    assert.equal(result.summary.finalPrice, 875.69);
  });
});

const sampleInput: CreateQuoteDto = {
  productId: 1,
  productTemplateId: 1,
  widthMm: 100,
  heightMm: 80,
  quantity: 5000,
  styleCount: 1,
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
    adhesiveTypes: ['permanent', 'removable'],
    deliveryForms: ['roll', 'sheet', 'sheet_cut', 'fan_fold'],
    surfaceFinishes: ['matte_lamination', 'waterproof', 'white_ink'],
    colorModes: ['four_color', 'four_color_white_ink', 'variable_data'],
    labelingMethods: ['manual', 'automatic'],
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
    additionalStyleFee: 30,
    designServiceFee: 120,
    sampleApprovalFee: 80,
  },
};
