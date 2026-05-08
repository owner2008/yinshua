import { Product, ProductCategory, ProductTemplate, TemplateOption } from './types';

export const sampleCategories: ProductCategory[] = [
  { id: '1', name: '不干胶标签', sort: 10, status: 'active' },
  { id: '2', name: '卷标标签', sort: 20, status: 'active' },
  { id: '3', name: '食品饮料标签', sort: 30, status: 'active' },
  { id: '4', name: '日化美妆标签', sort: 40, status: 'active' },
  { id: '5', name: '医药保健标签', sort: 50, status: 'active' },
  { id: '6', name: '工业电子标签', sort: 60, status: 'active' },
  { id: '7', name: '防伪标签', sort: 70, status: 'active' },
  { id: '8', name: '可变二维码 / 一物一码标签', sort: 80, status: 'active' },
  { id: '9', name: '产品说明书', sort: 90, status: 'active' },
  { id: '10', name: '包装盒 / 宣传册印刷', sort: 100, status: 'active' },
];

function buildOptions(spec: {
  materials: Array<[string, string]>;
  processes: Array<[string, string]>;
  printModes: Array<[string, string]>;
  shapes: Array<[string, string]>;
}): TemplateOption[] {
  return [
    ...spec.materials.map(([optionValue, optionLabel]) => ({ optionType: 'material' as const, optionValue, optionLabel })),
    ...spec.processes.map(([optionValue, optionLabel]) => ({ optionType: 'process' as const, optionValue, optionLabel })),
    ...spec.printModes.map(([optionValue, optionLabel]) => ({ optionType: 'print_mode' as const, optionValue, optionLabel })),
    ...spec.shapes.map(([optionValue, optionLabel]) => ({ optionType: 'shape' as const, optionValue, optionLabel })),
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
const MATERIAL_SYNTHETIC: [string, string] = ['2', '合成纸'];
const MATERIAL_PET: [string, string] = ['3', 'PET'];
const MATERIAL_PP: [string, string] = ['4', 'PP'];
const MATERIAL_SILVER: [string, string] = ['5', '哑银'];
const MATERIAL_CLEAR: [string, string] = ['6', '透明膜'];
const MATERIAL_REMOVABLE: [string, string] = ['7', '可移胶'];
const MATERIAL_FROZEN: [string, string] = ['8', '冷藏冷冻标签材质'];

const PROCESS_LAMINATION: [string, string] = ['lamination', '覆膜'];
const PROCESS_DIE_CUT: [string, string] = ['die_cut', '模切'];
const PROCESS_UV: [string, string] = ['uv', '局部 UV'];
const PROCESS_HOT_STAMP: [string, string] = ['hot_stamp', '烫金'];
const PROCESS_EMBOSS: [string, string] = ['emboss', '击凸'];
const PROCESS_QR: [string, string] = ['variable_qr', '可变二维码'];
const PROCESS_ANTI_FAKE: [string, string] = ['anti_fake', '防伪工艺'];
const PROCESS_PROOFING: [string, string] = ['proofing', '打样确认'];

const PRINT_FOUR_COLOR: [string, string] = ['four_color', '四色印刷'];
const PRINT_SPOT_COLOR: [string, string] = ['spot_color', '专色印刷'];
const PRINT_VARIABLE: [string, string] = ['variable_data', '可变数据印刷'];
const PRINT_SINGLE_COLOR: [string, string] = ['single_color', '单色印刷'];

const SHAPE_RECTANGLE: [string, string] = ['rectangle', '矩形'];
const SHAPE_ROUND: [string, string] = ['round', '圆形'];
const SHAPE_CUSTOM: [string, string] = ['custom', '异形'];

const commonSpec = {
  widthMin: 20,
  widthMax: 500,
  heightMin: 15,
  heightMax: 500,
  quantityMin: 500,
  quantityMax: 300000,
  minPrice: 200,
  allowProofing: true,
  allowLamination: true,
  allowDieCut: true,
  allowCustomShape: true,
  printModes: [PRINT_FOUR_COLOR, PRINT_SPOT_COLOR],
  shapes: [SHAPE_RECTANGLE, SHAPE_ROUND, SHAPE_CUSTOM],
};

const TEMPLATE_1 = createTemplate('1', '1', '不干胶标签标准报价模板', {
  ...commonSpec,
  materials: [MATERIAL_COATED, MATERIAL_PET, MATERIAL_PP, MATERIAL_REMOVABLE],
  processes: [PROCESS_LAMINATION, PROCESS_DIE_CUT, PROCESS_PROOFING],
});

const TEMPLATE_2 = createTemplate('2', '2', '卷标标签批量报价模板', {
  ...commonSpec,
  quantityMin: 1000,
  quantityMax: 500000,
  materials: [MATERIAL_COATED, MATERIAL_PET, MATERIAL_CLEAR],
  processes: [PROCESS_LAMINATION, PROCESS_DIE_CUT, PROCESS_QR, PROCESS_PROOFING],
});

const TEMPLATE_3 = createTemplate('3', '3', '食品饮料标签报价模板', {
  ...commonSpec,
  materials: [MATERIAL_COATED, MATERIAL_PET, MATERIAL_PP, MATERIAL_FROZEN],
  processes: [PROCESS_LAMINATION, PROCESS_DIE_CUT, PROCESS_PROOFING],
});

const TEMPLATE_4 = createTemplate('4', '4', '日化美妆标签报价模板', {
  ...commonSpec,
  minPrice: 320,
  allowUv: true,
  materials: [MATERIAL_CLEAR, MATERIAL_PET, MATERIAL_COATED],
  processes: [PROCESS_LAMINATION, PROCESS_HOT_STAMP, PROCESS_UV, PROCESS_DIE_CUT, PROCESS_PROOFING],
});

const TEMPLATE_5 = createTemplate('5', '5', '医药保健标签报价模板', {
  ...commonSpec,
  quantityMin: 1000,
  materials: [MATERIAL_COATED, MATERIAL_SYNTHETIC, MATERIAL_PET],
  processes: [PROCESS_LAMINATION, PROCESS_DIE_CUT, PROCESS_PROOFING],
  printModes: [PRINT_FOUR_COLOR, PRINT_SINGLE_COLOR],
});

const TEMPLATE_6 = createTemplate('6', '6', '工业电子标签报价模板', {
  ...commonSpec,
  materials: [MATERIAL_SILVER, MATERIAL_PET, MATERIAL_SYNTHETIC],
  processes: [PROCESS_LAMINATION, PROCESS_DIE_CUT, PROCESS_PROOFING],
  printModes: [PRINT_FOUR_COLOR, PRINT_SINGLE_COLOR],
});

const TEMPLATE_7 = createTemplate('7', '7', '防伪标签报价模板', {
  ...commonSpec,
  minPrice: 350,
  materials: [MATERIAL_PET, MATERIAL_SILVER, MATERIAL_COATED],
  processes: [PROCESS_ANTI_FAKE, PROCESS_DIE_CUT, PROCESS_QR, PROCESS_PROOFING],
  printModes: [PRINT_FOUR_COLOR, PRINT_VARIABLE],
});

const TEMPLATE_8 = createTemplate('8', '8', '一物一码标签报价模板', {
  ...commonSpec,
  quantityMin: 1000,
  materials: [MATERIAL_COATED, MATERIAL_PET, MATERIAL_CLEAR],
  processes: [PROCESS_QR, PROCESS_DIE_CUT, PROCESS_PROOFING],
  printModes: [PRINT_VARIABLE, PRINT_FOUR_COLOR],
});

const TEMPLATE_9 = createTemplate('9', '9', '产品说明书报价模板', {
  ...commonSpec,
  widthMin: 80,
  widthMax: 420,
  heightMin: 80,
  heightMax: 594,
  minPrice: 300,
  materials: [MATERIAL_COATED, MATERIAL_SYNTHETIC],
  processes: [PROCESS_DIE_CUT, PROCESS_PROOFING],
  printModes: [PRINT_FOUR_COLOR, PRINT_SINGLE_COLOR],
  shapes: [SHAPE_RECTANGLE],
});

const TEMPLATE_10 = createTemplate('10', '10', '包装盒 / 宣传册报价模板', {
  ...commonSpec,
  widthMin: 80,
  widthMax: 600,
  heightMin: 80,
  heightMax: 600,
  minPrice: 500,
  materials: [MATERIAL_COATED, MATERIAL_SYNTHETIC],
  processes: [PROCESS_LAMINATION, PROCESS_HOT_STAMP, PROCESS_UV, PROCESS_EMBOSS, PROCESS_PROOFING],
  printModes: [PRINT_FOUR_COLOR, PRINT_SPOT_COLOR],
  shapes: [SHAPE_RECTANGLE, SHAPE_CUSTOM],
});

export const sampleProducts: Product[] = [
  {
    id: '1',
    categoryId: '1',
    name: '不干胶标签',
    code: 'SELF-ADHESIVE-LABEL',
    description: '适用于食品、日化、工业、电商等多场景的基础标签产品，可按尺寸、材质和工艺定制。',
    applicationScenario: '食品包装、日化瓶贴、工业标识、电商商品贴纸',
    isHot: true,
    sort: 10,
    status: 'active',
    templates: [TEMPLATE_1],
  },
  {
    id: '2',
    categoryId: '2',
    name: '卷标标签',
    code: 'ROLL-LABEL',
    description: '适合自动贴标与批量生产，支持卷芯、出标方向、每卷数量等生产参数。',
    applicationScenario: '自动贴标、饮料瓶贴、物流仓储、批量供货',
    isHot: true,
    sort: 20,
    status: 'active',
    templates: [TEMPLATE_2],
  },
  {
    id: '3',
    categoryId: '3',
    name: '食品饮料标签',
    code: 'FOOD-DRINK-LABEL',
    description: '针对冷藏、防潮、瓶罐包装等食品饮料场景，兼顾粘性、色彩和安全合规展示。',
    applicationScenario: '饮料瓶贴、烘焙包装、休闲食品、冷藏冷冻标签',
    isHot: true,
    sort: 30,
    status: 'active',
    templates: [TEMPLATE_3],
  },
  {
    id: '4',
    categoryId: '4',
    name: '日化美妆标签',
    code: 'COSMETIC-LABEL',
    description: '强调货架质感与品牌识别，支持透明膜、烫金、局部 UV、覆膜等精致工艺。',
    applicationScenario: '洗护瓶贴、精华标签、香薰包装、美妆产品贴纸',
    isHot: true,
    sort: 40,
    status: 'active',
    templates: [TEMPLATE_4],
  },
  {
    id: '5',
    categoryId: '5',
    name: '医药保健标签',
    code: 'MEDICAL-HEALTH-LABEL',
    description: '版面信息清晰，批量一致性好，适用于药盒、保健品瓶身与说明标签。',
    applicationScenario: '药盒贴、保健品瓶贴、说明标签、批号追溯',
    sort: 50,
    status: 'active',
    templates: [TEMPLATE_5],
  },
  {
    id: '6',
    categoryId: '6',
    name: '工业电子标签',
    code: 'INDUSTRIAL-ELECTRONIC-LABEL',
    description: '耐磨耐候，适合设备铭牌、参数贴、警示贴和电子电器标识。',
    applicationScenario: '设备铭牌、参数标签、电子电器警示贴、工业资产标识',
    sort: 60,
    status: 'active',
    templates: [TEMPLATE_6],
  },
  {
    id: '7',
    categoryId: '7',
    name: '防伪标签',
    code: 'ANTI-COUNTERFEIT-LABEL',
    description: '通过防伪材料、可变二维码和专属工艺提升品牌可信度与渠道管控能力。',
    applicationScenario: '质保封签、防拆标签、品牌防伪、渠道管控',
    sort: 70,
    status: 'active',
    templates: [TEMPLATE_7],
  },
  {
    id: '8',
    categoryId: '8',
    name: '可变二维码 / 一物一码标签',
    code: 'VARIABLE-QR-LABEL',
    description: '支持可变数据印刷，用于扫码溯源、防伪验证、营销活动和一物一码管理。',
    applicationScenario: '产品溯源、防伪验证、渠道营销、扫码活动',
    isHot: true,
    sort: 80,
    status: 'active',
    templates: [TEMPLATE_8],
  },
  {
    id: '9',
    categoryId: '9',
    name: '产品说明书',
    code: 'PRODUCT-INSERT',
    description: '支持折页、说明书、随箱资料等印刷，信息清晰，适合与包装配套生产。',
    applicationScenario: '产品说明书、随箱资料、折页、保修卡',
    sort: 90,
    status: 'active',
    templates: [TEMPLATE_9],
  },
  {
    id: '10',
    categoryId: '10',
    name: '包装盒 / 宣传册印刷',
    code: 'PACKAGING-BROCHURE',
    description: '面向品牌包装和宣传资料，支持覆膜、烫金、局部 UV、击凸等工艺。',
    applicationScenario: '包装盒、宣传册、礼盒配套、品牌物料',
    sort: 100,
    status: 'active',
    templates: [TEMPLATE_10],
  },
];

export const sampleTemplates: ProductTemplate[] = sampleProducts.flatMap((product) =>
  (product.templates ?? []).map((template) => ({ ...template, product })),
);
