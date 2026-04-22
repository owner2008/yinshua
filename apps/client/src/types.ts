export interface Product {
  id: string;
  name: string;
  code: string;
  description?: string;
  applicationScenario?: string;
  coverImage?: string;
  status?: string;
  templates?: ProductTemplate[];
}

export interface ProductTemplate {
  id: string;
  productId: string;
  templateName: string;
  widthMin: string | number;
  widthMax: string | number;
  heightMin: string | number;
  heightMax: string | number;
  quantityMin: number;
  quantityMax: number;
  minPrice?: string | number;
  allowProofing?: boolean;
  allowLamination?: boolean;
  allowUv?: boolean;
  allowDieCut?: boolean;
  allowCustomShape?: boolean;
  options?: TemplateOption[];
  product?: Product;
}

export interface TemplateOption {
  optionType: 'material' | 'process' | 'print_mode' | 'shape' | string;
  optionValue: string;
  optionLabel: string;
}

export interface QuoteInput {
  productId: number;
  productTemplateId: number;
  widthMm: number;
  heightMm: number;
  quantity: number;
  materialId: number;
  printMode: string;
  shapeType: string;
  processCodes: string[];
  isProofing: boolean;
  isUrgent: boolean;
  customerType: 'personal' | 'company';
  memberId?: number;
}

export interface MemberSession {
  token: string;
  expiresAt: string;
  user: {
    id: string | number;
    wxOpenid?: string;
    nickname?: string;
    avatar?: string;
  };
}

export interface QuoteResult {
  quoteNo: string;
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
}

export interface MemberQuote {
  quoteNo: string;
  productId: number;
  productTemplateId: number;
  quantity: number;
  createdAt?: string;
  summary?: QuoteResult['summary'];
  snapshot?: {
    fullSnapshotJson?: QuoteResult;
  };
}
