import { Product, ProductCategory, ProductTemplate, TemplateOption } from './types';

export const sampleCategories: ProductCategory[] = [
  { id: '1', name: '铜版纸不干胶', sort: 10, status: 'active' },
  { id: '2', name: '透明膜标签', sort: 20, status: 'active' },
  { id: '3', name: '合成纸标签', sort: 30, status: 'active' },
  { id: '4', name: '热敏 / 物流标签', sort: 40, status: 'active' },
  { id: '5', name: '食品饮料标签', sort: 50, status: 'active' },
  { id: '6', name: '日化美妆标签', sort: 60, status: 'active' },
  { id: '7', name: '电子电器标签', sort: 70, status: 'active' },
  { id: '8', name: '医药保健标签', sort: 80, status: 'active' },
  { id: '9', name: '防伪 / 易碎标签', sort: 90, status: 'active' },
  { id: '10', name: '特殊工艺标签', sort: 100, status: 'active' },
  { id: '11', name: '包装封口标签', sort: 110, status: 'active' },
  { id: '12', name: '可移除标签', sort: 120, status: 'active' },
];

function buildOptions(spec: {
  materials: Array<[string, string]>;
  processes: Array<[string, string]>;
  printModes: Array<[string, string]>;
  shapes: Array<[string, string]>;
}): TemplateOption[] {
  return [
    ...spec.materials.map(([optionValue, optionLabel]) => ({
      optionType: 'material' as const,
      optionValue,
      optionLabel,
    })),
    ...spec.processes.map(([optionValue, optionLabel]) => ({
      optionType: 'process' as const,
      optionValue,
      optionLabel,
    })),
    ...spec.printModes.map(([optionValue, optionLabel]) => ({
      optionType: 'print_mode' as const,
      optionValue,
      optionLabel,
    })),
    ...spec.shapes.map(([optionValue, optionLabel]) => ({
      optionType: 'shape' as const,
      optionValue,
      optionLabel,
    })),
  ];
}

function createTemplate(
  id: string,
  productId: string,
  templateName: string,
  spec: {
    widthMin: number;
    widthMax: number;
    heightMin: number;
    heightMax: number;
    quantityMin: number;
    quantityMax: number;
    minPrice: number;
    allowProofing?: boolean;
    allowLamination?: boolean;
    allowUv?: boolean;
    allowDieCut?: boolean;
    allowCustomShape?: boolean;
    materials: Array<[string, string]>;
    processes: Array<[string, string]>;
    printModes: Array<[string, string]>;
    shapes: Array<[string, string]>;
  },
): ProductTemplate {
  return {
    id,
    productId,
    templateName,
    widthMin: spec.widthMin,
    widthMax: spec.widthMax,
    heightMin: spec.heightMin,
    heightMax: spec.heightMax,
    quantityMin: spec.quantityMin,
    quantityMax: spec.quantityMax,
    minPrice: spec.minPrice,
    allowProofing: spec.allowProofing,
    allowLamination: spec.allowLamination,
    allowUv: spec.allowUv,
    allowDieCut: spec.allowDieCut,
    allowCustomShape: spec.allowCustomShape,
    options: buildOptions(spec),
  };
}

const MATERIAL_COATED: [string, string] = ['1', '铜版纸'];
const MATERIAL_PET: [string, string] = ['2', '透明膜'];
const MATERIAL_THERMAL: [string, string] = ['4', '热敏纸'];
const MATERIAL_PVC: [string, string] = ['5', '合成纸'];
const MATERIAL_FRAGILE: [string, string] = ['6', '易碎防伪纸'];
const MATERIAL_REMOVABLE: [string, string] = ['7', '可移除胶铜版纸'];

const PROCESS_LAMINATION: [string, string] = ['lamination', '覆膜'];
const PROCESS_DIE_CUT: [string, string] = ['die_cut', '模切'];
const PROCESS_UV: [string, string] = ['uv', '局部光油'];
const PROCESS_HOT_STAMP: [string, string] = ['hot_stamp', '烫金'];
const PROCESS_PROOFING: [string, string] = ['proofing', '打样'];

const PRINT_FOUR_COLOR: [string, string] = ['four_color', '四色印刷'];
const PRINT_SINGLE_COLOR: [string, string] = ['single_color', '单色印刷'];

const SHAPE_RECTANGLE: [string, string] = ['rectangle', '矩形'];
const SHAPE_CUSTOM: [string, string] = ['custom', '异形'];

const TEMPLATE_1 = createTemplate('1', '1', '透明膜标准报价模板', {
  widthMin: 20,
  widthMax: 500,
  heightMin: 20,
  heightMax: 500,
  quantityMin: 100,
  quantityMax: 100000,
  minPrice: 300,
  allowProofing: true,
  allowLamination: true,
  allowUv: true,
  allowDieCut: true,
  allowCustomShape: true,
  materials: [MATERIAL_COATED, MATERIAL_PET],
  processes: [PROCESS_LAMINATION, PROCESS_DIE_CUT, PROCESS_UV, PROCESS_PROOFING],
  printModes: [PRINT_FOUR_COLOR, PRINT_SINGLE_COLOR],
  shapes: [SHAPE_RECTANGLE, SHAPE_CUSTOM],
});

const TEMPLATE_2 = createTemplate('2', '2', '铜版纸彩色报价模板', {
  widthMin: 30,
  widthMax: 400,
  heightMin: 20,
  heightMax: 400,
  quantityMin: 500,
  quantityMax: 200000,
  minPrice: 200,
  allowProofing: true,
  allowLamination: true,
  allowDieCut: true,
  materials: [MATERIAL_COATED],
  processes: [PROCESS_LAMINATION, PROCESS_DIE_CUT, PROCESS_PROOFING],
  printModes: [PRINT_FOUR_COLOR, PRINT_SINGLE_COLOR],
  shapes: [SHAPE_RECTANGLE],
});

const TEMPLATE_3 = createTemplate('3', '3', '烫金工艺报价模板', {
  widthMin: 40,
  widthMax: 300,
  heightMin: 30,
  heightMax: 300,
  quantityMin: 200,
  quantityMax: 50000,
  minPrice: 500,
  allowProofing: true,
  allowDieCut: true,
  allowCustomShape: true,
  materials: [MATERIAL_COATED, MATERIAL_PET],
  processes: [PROCESS_HOT_STAMP, PROCESS_DIE_CUT, PROCESS_PROOFING],
  printModes: [PRINT_FOUR_COLOR],
  shapes: [SHAPE_RECTANGLE, SHAPE_CUSTOM],
});

const TEMPLATE_4 = createTemplate('4', '4', '热敏物流报价模板', {
  widthMin: 30,
  widthMax: 200,
  heightMin: 30,
  heightMax: 200,
  quantityMin: 1000,
  quantityMax: 500000,
  minPrice: 150,
  allowDieCut: true,
  materials: [MATERIAL_THERMAL],
  processes: [PROCESS_DIE_CUT],
  printModes: [PRINT_SINGLE_COLOR],
  shapes: [SHAPE_RECTANGLE],
});

const TEMPLATE_5 = createTemplate('5', '5', '合成纸耐候报价模板', {
  widthMin: 30,
  widthMax: 450,
  heightMin: 20,
  heightMax: 450,
  quantityMin: 300,
  quantityMax: 150000,
  minPrice: 260,
  allowProofing: true,
  allowLamination: true,
  allowUv: true,
  allowDieCut: true,
  allowCustomShape: true,
  materials: [MATERIAL_PVC],
  processes: [PROCESS_LAMINATION, PROCESS_DIE_CUT, PROCESS_UV, PROCESS_PROOFING],
  printModes: [PRINT_FOUR_COLOR],
  shapes: [SHAPE_RECTANGLE, SHAPE_CUSTOM],
});

const TEMPLATE_6 = createTemplate('6', '6', '食品饮料标签报价模板', {
  widthMin: 25,
  widthMax: 420,
  heightMin: 20,
  heightMax: 420,
  quantityMin: 500,
  quantityMax: 300000,
  minPrice: 220,
  allowProofing: true,
  allowLamination: true,
  allowDieCut: true,
  allowCustomShape: true,
  materials: [MATERIAL_COATED, MATERIAL_PET],
  processes: [PROCESS_LAMINATION, PROCESS_DIE_CUT, PROCESS_PROOFING],
  printModes: [PRINT_FOUR_COLOR, PRINT_SINGLE_COLOR],
  shapes: [SHAPE_RECTANGLE, SHAPE_CUSTOM],
});

const TEMPLATE_7 = createTemplate('7', '7', '日化美妆标签报价模板', {
  widthMin: 25,
  widthMax: 360,
  heightMin: 20,
  heightMax: 360,
  quantityMin: 500,
  quantityMax: 200000,
  minPrice: 320,
  allowProofing: true,
  allowLamination: true,
  allowUv: true,
  allowDieCut: true,
  allowCustomShape: true,
  materials: [MATERIAL_COATED, MATERIAL_PET],
  processes: [PROCESS_LAMINATION, PROCESS_HOT_STAMP, PROCESS_UV, PROCESS_DIE_CUT, PROCESS_PROOFING],
  printModes: [PRINT_FOUR_COLOR],
  shapes: [SHAPE_RECTANGLE, SHAPE_CUSTOM],
});

const TEMPLATE_8 = createTemplate('8', '8', '电子电器铭牌标签报价模板', {
  widthMin: 20,
  widthMax: 300,
  heightMin: 15,
  heightMax: 300,
  quantityMin: 500,
  quantityMax: 200000,
  minPrice: 260,
  allowProofing: true,
  allowLamination: true,
  allowDieCut: true,
  allowCustomShape: true,
  materials: [MATERIAL_PET, MATERIAL_PVC],
  processes: [PROCESS_LAMINATION, PROCESS_DIE_CUT, PROCESS_PROOFING],
  printModes: [PRINT_FOUR_COLOR, PRINT_SINGLE_COLOR],
  shapes: [SHAPE_RECTANGLE, SHAPE_CUSTOM],
});

const TEMPLATE_9 = createTemplate('9', '9', '医药保健标签报价模板', {
  widthMin: 20,
  widthMax: 300,
  heightMin: 15,
  heightMax: 300,
  quantityMin: 1000,
  quantityMax: 500000,
  minPrice: 200,
  allowProofing: true,
  allowLamination: true,
  allowDieCut: true,
  materials: [MATERIAL_COATED],
  processes: [PROCESS_LAMINATION, PROCESS_DIE_CUT, PROCESS_PROOFING],
  printModes: [PRINT_FOUR_COLOR, PRINT_SINGLE_COLOR],
  shapes: [SHAPE_RECTANGLE],
});

const TEMPLATE_10 = createTemplate('10', '10', '防伪易碎标签报价模板', {
  widthMin: 20,
  widthMax: 260,
  heightMin: 15,
  heightMax: 260,
  quantityMin: 500,
  quantityMax: 120000,
  minPrice: 350,
  allowProofing: true,
  allowDieCut: true,
  allowCustomShape: true,
  materials: [MATERIAL_FRAGILE],
  processes: [PROCESS_DIE_CUT, PROCESS_PROOFING],
  printModes: [PRINT_FOUR_COLOR, PRINT_SINGLE_COLOR],
  shapes: [SHAPE_RECTANGLE, SHAPE_CUSTOM],
});

const TEMPLATE_11 = createTemplate('11', '11', '包装封口标签报价模板', {
  widthMin: 20,
  widthMax: 320,
  heightMin: 15,
  heightMax: 320,
  quantityMin: 1000,
  quantityMax: 500000,
  minPrice: 180,
  allowProofing: true,
  allowLamination: true,
  allowDieCut: true,
  allowCustomShape: true,
  materials: [MATERIAL_COATED, MATERIAL_PET],
  processes: [PROCESS_LAMINATION, PROCESS_DIE_CUT, PROCESS_PROOFING],
  printModes: [PRINT_FOUR_COLOR],
  shapes: [SHAPE_RECTANGLE, SHAPE_CUSTOM],
});

const TEMPLATE_12 = createTemplate('12', '12', '可移除标签报价模板', {
  widthMin: 20,
  widthMax: 360,
  heightMin: 15,
  heightMax: 360,
  quantityMin: 500,
  quantityMax: 150000,
  minPrice: 240,
  allowProofing: true,
  allowDieCut: true,
  allowCustomShape: true,
  materials: [MATERIAL_REMOVABLE],
  processes: [PROCESS_DIE_CUT, PROCESS_PROOFING],
  printModes: [PRINT_FOUR_COLOR, PRINT_SINGLE_COLOR],
  shapes: [SHAPE_RECTANGLE, SHAPE_CUSTOM],
});

export const sampleProducts: Product[] = [
  {
    id: '1',
    categoryId: '2',
    name: '透明膜标签',
    code: 'PET-LABEL',
    description: '适合瓶身、食品包装、日化贴标等高透明场景。',
    applicationScenario: '日化瓶贴、食品包装、礼盒封签',
    isHot: true,
    sort: 10,
    status: 'active',
    templates: [TEMPLATE_1],
  },
  {
    id: '2',
    categoryId: '1',
    name: '铜版纸彩色标签',
    code: 'COATED-LABEL',
    description: '铜版纸材质彩色印刷标签，性价比高，适合大批量使用。',
    applicationScenario: '食品包装、电商发货标签、普通商品贴纸',
    isHot: true,
    sort: 20,
    status: 'active',
    templates: [TEMPLATE_2],
  },
  {
    id: '3',
    categoryId: '10',
    name: '烫金工艺标签',
    code: 'HOT-STAMP-LABEL',
    description: '铜版纸或透明膜材质叠加烫金工艺，适合强调质感的产品包装。',
    applicationScenario: '礼品、高端酒水、化妆品',
    sort: 30,
    status: 'active',
    templates: [TEMPLATE_3],
  },
  {
    id: '4',
    categoryId: '4',
    name: '热敏物流标签',
    code: 'THERMAL-LABEL',
    description: '热敏材质物流标签，适合快递、仓储扫码打印。',
    applicationScenario: '电商仓储、快递物流、条码贴纸',
    sort: 40,
    status: 'active',
    templates: [TEMPLATE_4],
  },
  {
    id: '5',
    categoryId: '3',
    name: '合成纸耐候标签',
    code: 'PVC-SYNTHETIC-LABEL',
    description: '耐水耐磨的合成纸不干胶标签，适合户外和设备标识。',
    applicationScenario: '户外标识、设备贴、周转箱标签',
    sort: 50,
    status: 'active',
    templates: [TEMPLATE_5],
  },
  {
    id: '6',
    categoryId: '5',
    name: '食品饮料标签',
    code: 'FOOD-DRINK-LABEL',
    description: '适合食品、饮品瓶贴和外包装贴标，可按场景选择铜版纸或透明膜。',
    applicationScenario: '饮料瓶贴、烘焙包装、休闲食品标签',
    isHot: true,
    sort: 60,
    status: 'active',
    templates: [TEMPLATE_6],
  },
  {
    id: '7',
    categoryId: '6',
    name: '日化美妆标签',
    code: 'COSMETIC-LABEL',
    description: '适合洗护、美妆、香薰等包装标签，支持覆膜、局部光油、烫金等工艺。',
    applicationScenario: '洗护瓶贴、精华标签、香薰包装',
    isHot: true,
    sort: 70,
    status: 'active',
    templates: [TEMPLATE_7],
  },
  {
    id: '8',
    categoryId: '7',
    name: '电子电器铭牌标签',
    code: 'ELECTRONIC-NAMEPLATE',
    description: '适合设备铭牌、参数贴和电子电器警示标签，兼顾耐磨和清晰度。',
    applicationScenario: '设备铭牌、参数标签、警示贴',
    sort: 80,
    status: 'active',
    templates: [TEMPLATE_8],
  },
  {
    id: '9',
    categoryId: '8',
    name: '医药保健标签',
    code: 'MEDICAL-HEALTH-LABEL',
    description: '适合药盒、保健品瓶身和说明标签，版面清晰、批量稳定。',
    applicationScenario: '药盒贴、保健品瓶贴、说明标签',
    sort: 90,
    status: 'active',
    templates: [TEMPLATE_9],
  },
  {
    id: '10',
    categoryId: '9',
    name: '防伪易碎标签',
    code: 'TAMPER-EVIDENT-LABEL',
    description: '使用易碎防伪纸，撕开后难以复原，适合封口和防拆场景。',
    applicationScenario: '质保封签、防拆标签、电子产品封口',
    sort: 100,
    status: 'active',
    templates: [TEMPLATE_10],
  },
  {
    id: '11',
    categoryId: '11',
    name: '包装封口标签',
    code: 'SEALING-LABEL',
    description: '适合盒装、袋装和礼盒封口，可按品牌包装定制尺寸与形状。',
    applicationScenario: '礼盒封签、食品袋封口、外包装贴纸',
    sort: 110,
    status: 'active',
    templates: [TEMPLATE_11],
  },
  {
    id: '12',
    categoryId: '12',
    name: '可移除标签',
    code: 'REMOVABLE-LABEL',
    description: '可移除胶标签，适合临时标识、促销贴和不留胶场景。',
    applicationScenario: '临时标识、促销贴、玻璃贴',
    sort: 120,
    status: 'active',
    templates: [TEMPLATE_12],
  },
];

export const sampleTemplates: ProductTemplate[] = sampleProducts.flatMap((product) =>
  (product.templates ?? []).map((template) => ({ ...template, product })),
);
