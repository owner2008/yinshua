export interface Product {
  id: string;
  name: string;
  code: string;
  categoryId?: string | number | null;
  description?: string;
  applicationScenario?: string;
  coverImage?: string;
  galleryJson?: string[] | null;
  status?: string;
  isHot?: boolean;
  sort?: number;
  templates?: ProductTemplate[];
  category?: ProductCategory | null;
}

export interface ProductCategory {
  id: string | number;
  name: string;
  sort?: number;
  status?: string;
  parentId?: string | number | null;
}

export interface CatalogHome {
  branding?: HomepageBranding | null;
  banners?: HomepageBanner[];
  companyProfile?: CompanyProfile | null;
  categories: ProductCategory[];
  categoryEquipmentShowcases?: CategoryEquipmentShowcase[];
  hotProducts: Product[];
  latestProducts: Product[];
}

export interface HomepageBranding {
  id: string | number;
  siteName: string;
  siteSubtitle?: string;
  logoImage?: string;
  headerNotice?: string;
  themeMode?: 'graphite' | 'ivory' | 'forest' | string;
  status?: string;
}

export interface HomepageBanner {
  id: string | number;
  title: string;
  subtitle?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  linkType?: string;
  linkValue?: string;
  buttonText?: string;
  sort?: number;
  status?: string;
  startAt?: string | null;
  endAt?: string | null;
}

export interface CompanyProfile {
  id: string | number;
  title: string;
  subtitle?: string;
  coverImage?: string;
  galleryJson?: string[] | null;
  content?: string;
  contactPhone?: string;
  contactWechat?: string;
  address?: string;
  sort?: number;
  status?: string;
}

export interface CategoryEquipmentShowcase {
  id: string | number;
  categoryId: string | number;
  category?: ProductCategory | null;
  name: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  galleryJson?: string[] | null;
  specsJson?: Record<string, unknown> | null;
  sort?: number;
  status?: string;
}

export interface MemberProfile {
  id?: string | number;
  userId?: string | number;
  memberNo?: string;
  mobile?: string;
  nickname?: string;
  customerType?: 'personal' | 'company';
  companyName?: string;
  contactName?: string;
  taxNo?: string;
  industry?: string;
  source?: string;
  remark?: string;
  levelId?: string | number | null;
}

export interface MemberAddress {
  id: string | number;
  consignee: string;
  mobile: string;
  province: string;
  city: string;
  district?: string;
  detail: string;
  isDefault?: boolean;
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
  deliveryForm?: string;
  labelingMethod?: string;
  rollDirection?: string;
  rollCoreMm?: number;
  piecesPerRoll?: number;
  adhesiveType?: string;
  usageEnvironment?: string;
  surfaceFinish?: string;
  colorMode?: string;
  hasDesignFile?: boolean;
  designFileUrl?: string;
  needDesignService?: boolean;
  needSampleApproval?: boolean;
  packagingMethod?: string;
  expectedDeliveryDate?: string;
  quoteRemark?: string;
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
