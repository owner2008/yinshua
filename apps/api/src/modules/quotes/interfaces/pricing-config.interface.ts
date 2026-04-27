export type FeeMode =
  | 'fixed'
  | 'per_area'
  | 'per_qty'
  | 'fixed_plus_qty'
  | 'fixed_plus_area';

export interface ProductTemplateConfig {
  id: number;
  productId: number;
  widthMin: number;
  widthMax: number;
  heightMin: number;
  heightMax: number;
  quantityMin: number;
  quantityMax: number;
  materialIds: number[];
  processCodes: string[];
  printModes: string[];
  shapeTypes: string[];
  allowProofing: boolean;
}

export interface MaterialPriceConfig {
  materialId: number;
  materialName: string;
  unitPrice: number;
}

export interface PrintPriceConfig {
  printMode: string;
  unitPrice: number;
  setupFee: number;
}

export interface ProcessPriceConfig {
  code: string;
  name: string;
  feeMode: FeeMode;
  unitPrice: number;
  setupFee: number;
  minFee: number;
}

export interface RuleConfig {
  ruleSetId: number;
  versionNo: string;
  lossRate: number;
  profitRate: number;
  memberRate: number;
  minPrice: number;
  packageFee: number;
  urgentFeeRate: number;
  whiteInkUnitPrice: number;
  whiteInkSetupFee: number;
  whiteInkMinFee: number;
  variableDataUnitPrice: number;
  variableDataMinFee: number;
  protectiveFinishUnitPrice: number;
  protectiveFinishMinFee: number;
  rollSplitFeePerRoll: number;
  sheetCuttingFee: number;
  fanFoldFee: number;
}

export interface MatchedQuoteConfig {
  template: ProductTemplateConfig;
  material: MaterialPriceConfig;
  print: PrintPriceConfig;
  processes: ProcessPriceConfig[];
  rule: RuleConfig;
}
