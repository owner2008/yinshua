export interface Product {
  id: string;
  name: string;
  code: string;
  status: string;
  description?: string;
  coverImage?: string;
  applicationScenario?: string;
  templates?: ProductTemplate[];
}

export interface ProductTemplate {
  id: string;
  productId: string;
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
  productId: number;
  productTemplateId: number;
  quantity: number;
  status?: string;
  createdAt?: string;
  snapshot?: Record<string, unknown>;
  summary: {
    finalPrice: number;
    unitPrice: number;
    baseCost: number;
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

