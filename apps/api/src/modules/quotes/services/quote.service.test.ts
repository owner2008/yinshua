import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CreateQuoteDto } from '../dto/create-quote.dto';
import { QuoteService } from './quote.service';

describe('QuoteService admin operations', () => {
  it('previews a quote with matched rule metadata without persisting it', async () => {
    let savedSnapshot = false;
    let persistedQuote = false;
    let validatedTemplateId: number | undefined;
    const dto: CreateQuoteDto = {
      productId: 1,
      productTemplateId: 1,
      widthMm: 100,
      heightMm: 80,
      quantity: 5000,
      materialId: 2,
      printMode: 'four_color',
      shapeType: 'rectangle',
      processCodes: ['lamination', 'die_cut'],
      customerType: 'company',
    };
    const matchedConfig = {
      template: {
        id: 1,
        productId: 1,
        widthMin: 20,
        widthMax: 500,
        heightMin: 20,
        heightMax: 500,
        quantityMin: 100,
        quantityMax: 100000,
        materialIds: [2],
        processCodes: ['lamination', 'die_cut'],
        printModes: ['four_color'],
        shapeTypes: ['rectangle'],
        allowProofing: true,
      },
      material: { materialId: 2, materialName: 'PET', unitPrice: 1.5 },
      print: { printMode: 'four_color', unitPrice: 0.03, setupFee: 50 },
      processes: [],
      rule: {
        ruleSetId: 3,
        ruleId: 9,
        versionNo: 'RULE-COMPANY-V2',
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
    const result = {
      quoteNo: 'PREVIEW',
      productId: 1,
      productTemplateId: 1,
      dimensions: { widthMm: 100, heightMm: 80, areaM2: 0.008 },
      quantity: 5000,
      material: { materialId: 2, materialName: 'PET', unitPrice: 1.5, lossRate: 1.08, cost: 64.8 },
      print: { printMode: 'four_color', unitPrice: 0.03, setupFee: 50, cost: 200 },
      processes: [],
      extraFees: [],
      summary: {
        baseCost: 284.8,
        profitRate: 1.35,
        salePrice: 384.48,
        memberRate: 0.95,
        finalPrice: 365.26,
        unitPrice: 0.0731,
        minPriceApplied: false,
      },
      snapshot: {
        input: dto,
        ruleSetId: 3,
        ruleVersion: 'RULE-COMPANY-V2',
        pricing: { rule: matchedConfig.rule },
        result: {},
      },
    };
    const service = new QuoteService(
      { match: async () => matchedConfig } as never,
      { validate: (_dto: unknown, template: { id: number }) => { validatedTemplateId = template.id; } } as never,
      { calculate: () => result } as never,
      { save: () => { savedSnapshot = true; } } as never,
      { quote: { create: () => { persistedQuote = true; } } } as never,
    );

    const preview = await service.preview(dto);

    assert.equal(validatedTemplateId, 1);
    assert.equal(preview.matchedRule.ruleSetId, 3);
    assert.equal(preview.matchedRule.ruleId, 9);
    assert.equal(preview.matchedRule.versionNo, 'RULE-COMPANY-V2');
    assert.equal(preview.result.summary.finalPrice, 365.26);
    assert.equal(savedSnapshot, false);
    assert.equal(persistedQuote, false);
  });

  it('updates quote status and keeps the latest follow remark without changing the snapshot', async () => {
    const calls: Array<{ status: string; processOptionsJson: unknown }> = [];
    const quoteNo = 'Q202604290001';
    const fullSnapshot = {
      quoteNo,
      productId: 1,
      productTemplateId: 1,
      dimensions: { widthMm: 100, heightMm: 80, areaM2: 0.008 },
      quantity: 5000,
      material: { materialId: 2, materialName: 'PET', unitPrice: 1, lossRate: 1, cost: 1 },
      print: { printMode: 'four_color', unitPrice: 1, setupFee: 0, cost: 1 },
      processes: [],
      extraFees: [],
      summary: {
        baseCost: 100,
        profitRate: 1.35,
        salePrice: 135,
        memberRate: 1,
        finalPrice: 135,
        unitPrice: 0.027,
        minPriceApplied: false,
      },
      snapshot: { input: {}, ruleSetId: 1, ruleVersion: 'v1', pricing: {}, result: {} },
    };
    const before = {
      id: 12n,
      quoteNo,
      status: 'draft',
      processOptionsJson: { processCodes: ['lamination'] },
      snapshot: { fullSnapshotJson: fullSnapshot },
    };
    const prisma = {
      quote: {
        findUnique: async () => before,
        update: async ({ data }: { data: { status: string; processOptionsJson: unknown } }) => {
          calls.push(data);
          return {
            ...before,
            status: data.status,
            processOptionsJson: data.processOptionsJson,
          };
        },
      },
    };
    const audit = {
      records: [] as unknown[],
      record(input: unknown) {
        this.records.push(input);
      },
    };
    const service = new QuoteService(
      undefined as never,
      undefined as never,
      undefined as never,
      undefined as never,
      prisma as never,
      audit as never,
    );

    const updated = await service.updateAdminStatus(quoteNo, {
      status: 'contacted',
      followRemark: '已电话沟通，客户希望明天确认数量。',
    });

    assert.equal(updated?.status, 'contacted');
    assert.equal(updated?.followRemark, '已电话沟通，客户希望明天确认数量。');
    assert.equal(calls[0].status, 'contacted');
    assert.deepEqual(calls[0].processOptionsJson, {
      processCodes: ['lamination'],
      followRemark: '已电话沟通，客户希望明天确认数量。',
    });
    assert.equal(audit.records.length, 1);
  });
});
