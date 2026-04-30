export interface Product {
  id: string;
  name: string;
  code: string;
  status: string;
  description?: string;
  coverImage?: string;
  galleryJson?: string[] | null;
  applicationScenario?: string;
  categoryId?: string | null;
  category?: ProductCategory | null;
  sort?: number;
  isHot?: boolean;
  templates?: ProductTemplate[];
}

export interface ProductCategory {
  id: string;
  parentId?: string | null;
  name: string;
  sort: number;
  status: string;
}

export interface ProductTemplate {
  id: string;
  productId: string;
  product?: Product;
  templateName: string;
  widthMin: string;
  widthMax: string;
  heightMin: string;
  heightMax: string;
  quantityMin: number;
  quantityMax: number;
  minPrice: string;
  defaultLossRate?: string;
  allowCustomShape?: boolean;
  allowLamination?: boolean;
  allowHotStamping?: boolean;
  allowUv?: boolean;
  allowDieCut?: boolean;
  allowProofing?: boolean;
  status?: string;
  options?: ProductTemplateOption[];
}

export interface ProductTemplateOption {
  id: string;
  optionType: 'material' | 'process' | 'print_mode' | 'shape';
  optionValue: string;
  optionLabel: string;
}

export interface Material {
  id: string;
  code: string;
  name: string;
  type: string;
  unit: string;
  spec?: string;
  brand?: string;
  status: string;
  prices?: MaterialPrice[];
}

export interface MaterialPrice {
  id: string;
  materialId: string;
  material?: Material;
  priceType: string;
  unitPrice: string;
  currency: string;
  isCurrent: boolean;
  effectiveFrom?: string;
}

export interface Process {
  id: string;
  code: string;
  name: string;
  processType: string;
  feeMode: string;
  status: string;
  prices?: ProcessPrice[];
}

export interface ProcessPrice {
  id: string;
  processId: string;
  process?: Process;
  feeMode: string;
  unitPrice: string;
  minFee: string;
  setupFee: string;
  isCurrent: boolean;
  effectiveFrom?: string;
}

export interface PrintPrice {
  id: string;
  printMode: string;
  feeMode: string;
  unitPrice: string;
  setupFee: string;
  isCurrent: boolean;
  effectiveFrom?: string;
}

export interface QuoteRuleSet {
  id: string;
  productTemplateId: string;
  name: string;
  scene: string;
  priority: number;
  versionNo: string;
  status: string;
  rules?: QuoteRule[];
}

export interface QuoteRule {
  id: string;
  ruleSetId: string;
  ruleSet?: QuoteRuleSet;
  conditionJson: Record<string, unknown>;
  configJson: Record<string, unknown>;
  enabled: boolean;
}

export interface Quote {
  quoteNo: string;
  followRemark?: string;
  productId: number;
  productTemplateId: number;
  quantity: number;
  status?: string;
  createdAt?: string;
  snapshot?: Record<string, unknown>;
  material?: {
    materialId: number;
    materialName: string;
    unitPrice: number;
    lossRate: number;
    cost: number;
  };
  print?: {
    printMode: string;
    unitPrice: number;
    setupFee: number;
    cost: number;
  };
  processes?: Array<{
    code: string;
    name: string;
    feeMode: string;
    unitPrice: number;
    setupFee: number;
    cost: number;
  }>;
  extraFees?: Array<{
    code: string;
    name: string;
    amount: number;
  }>;
  summary: {
    finalPrice: number;
    unitPrice: number;
    baseCost: number;
    salePrice?: number;
    minPriceApplied?: boolean;
  };
}

export interface QuotePreviewResult {
  matchedRule: {
    ruleSetId: number;
    ruleId?: number;
    versionNo: string;
    config: Record<string, unknown>;
  };
  result: Quote & {
    dimensions: {
      widthMm: number;
      heightMm: number;
      areaM2: number;
    };
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
  };
}

export interface MemberLevel {
  id: string;
  name: string;
  code: string;
  discountRate: string;
  priority: number;
  remark?: string;
}

export interface MemberProfile {
  id: string;
  userId: string;
  memberNo: string;
  customerType: 'personal' | 'company' | string;
  companyName?: string;
  contactName?: string;
  taxNo?: string;
  industry?: string;
  source?: string;
  levelId?: string | null;
  level?: MemberLevel | null;
  remark?: string;
}

export interface MemberAddress {
  id: string;
  consignee: string;
  mobile: string;
  province: string;
  city: string;
  district?: string;
  detail: string;
  isDefault: boolean;
}

export interface Member {
  id: string;
  wxOpenid?: string;
  mobile?: string;
  nickname?: string;
  avatar?: string;
  status: string;
  createdAt?: string;
  profile?: MemberProfile | null;
  addresses?: MemberAddress[];
  _count?: {
    quotes?: number;
    addresses?: number;
  };
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  type: string;
  status: string;
  managerId?: string;
}

export interface StockItem {
  id: string;
  materialId: string;
  warehouseId: string;
  material?: Material;
  warehouse?: Warehouse;
  qty: string;
  availableQty: string;
  reservedQty: string;
  safetyQty: string;
}

export interface StockMovement {
  id: string;
  movementNo: string;
  movementType: 'in' | 'out' | 'adjust';
  materialId: string;
  warehouseId: string;
  material?: Material;
  warehouse?: Warehouse;
  qty: string;
  unitCost?: string;
  refType?: string;
  refId?: string;
  createdAt?: string;
}

export interface OperationLog {
  id: string;
  module: string;
  action: string;
  targetType: string;
  targetId: string;
  beforeJson?: Record<string, unknown>;
  afterJson?: Record<string, unknown>;
  createdAt: string;
}

export interface AdminPermission {
  id: string;
  code: string;
  name: string;
  module: string;
  description?: string;
}

export interface AdminRolePermission {
  permissionId: string;
  permission: AdminPermission;
}

export interface AdminRole {
  id: string;
  code: string;
  name: string;
  description?: string;
  status: string;
  permissions?: AdminRolePermission[];
  users?: unknown[];
}

export interface AdminUserRole {
  roleId: string;
  role: AdminRole;
}

export interface AdminUser {
  id: string;
  username: string;
  displayName?: string;
  status: string;
  lastLoginAt?: string;
  createdAt?: string;
  roles?: AdminUserRole[];
}

export interface CompanyProfile {
  id: string;
  title: string;
  subtitle?: string;
  coverImage?: string;
  galleryJson?: string[];
  content?: string;
  contactPhone?: string;
  contactWechat?: string;
  address?: string;
  sort: number;
  status: string;
}

export interface HomepageBranding {
  id: string;
  siteName: string;
  siteSubtitle?: string;
  logoImage?: string;
  headerNotice?: string;
  themeMode?: 'graphite' | 'ivory' | 'forest' | string;
  status: string;
}

export interface HomepageBanner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  linkType: string;
  linkValue?: string;
  buttonText?: string;
  sort: number;
  status: string;
  startAt?: string | null;
  endAt?: string | null;
}

export interface CategoryEquipmentShowcase {
  id: string;
  categoryId: string;
  category?: ProductCategory | null;
  name: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  galleryJson?: string[];
  specsJson?: Record<string, unknown>;
  sort: number;
  status: string;
}

export interface UploadedContentAsset {
  url: string;
  fileName: string;
  size: number;
}
