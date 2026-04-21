export interface Product {
  id: string;
  name: string;
  code: string;
  status: string;
  description?: string;
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
}

export interface Material {
  id: string;
  code: string;
  name: string;
  type: string;
  unit: string;
  status: string;
}

export interface Process {
  id: string;
  code: string;
  name: string;
  processType: string;
  feeMode: string;
  status: string;
}

export interface Quote {
  quoteNo: string;
  productId: number;
  productTemplateId: number;
  quantity: number;
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
}

