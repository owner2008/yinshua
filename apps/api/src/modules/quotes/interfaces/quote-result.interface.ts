export interface QuoteResult {
  quoteNo: string;
  status?: string;
  followRemark?: string;
  productId: number;
  productTemplateId: number;
  dimensions: {
    widthMm: number;
    heightMm: number;
    areaM2: number;
  };
  quantity: number;
  material: {
    materialId: number;
    materialName: string;
    unitPrice: number;
    lossRate: number;
    cost: number;
  };
  print: {
    printMode: string;
    unitPrice: number;
    setupFee: number;
    cost: number;
  };
  processes: Array<{
    code: string;
    name: string;
    feeMode: string;
    unitPrice: number;
    setupFee: number;
    cost: number;
  }>;
  extraFees: Array<{
    code: string;
    name: string;
    amount: number;
  }>;
  summary: {
    baseCost: number;
    profitRate: number;
    salePrice: number;
    memberRate: number;
    finalPrice: number;
    unitPrice: number;
    minPriceApplied: boolean;
  };
  snapshot: QuoteSnapshot;
}

export interface QuoteSnapshot {
  input: Record<string, unknown>;
  ruleSetId: number;
  ruleVersion: string;
  pricing: Record<string, unknown>;
  result: Record<string, unknown>;
}
