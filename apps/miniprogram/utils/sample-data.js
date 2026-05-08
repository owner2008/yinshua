const sampleCategories = [
  { id: '1', name: '不干胶标签', sort: 10, status: 'active' },
  { id: '2', name: '卷标标签', sort: 20, status: 'active' },
  { id: '3', name: '食品饮料标签', sort: 30, status: 'active' },
  { id: '4', name: '日化美妆标签', sort: 40, status: 'active' },
  { id: '5', name: '医药保健标签', sort: 50, status: 'active' },
  { id: '6', name: '工业电子标签', sort: 60, status: 'active' },
  { id: '7', name: '防伪标签', sort: 70, status: 'active' },
  { id: '8', name: '可变二维码标签', sort: 80, status: 'active' },
  { id: '9', name: '产品说明书', sort: 90, status: 'active' },
  { id: '10', name: '包装盒 / 宣传册印刷', sort: 100, status: 'active' },
];

function buildOptions(spec) {
  const rows = [];
  (spec.materials || []).forEach(([optionValue, optionLabel]) => rows.push({ optionType: 'material', optionValue, optionLabel }));
  (spec.processes || []).forEach(([optionValue, optionLabel]) => rows.push({ optionType: 'process', optionValue, optionLabel }));
  (spec.printModes || []).forEach(([optionValue, optionLabel]) => rows.push({ optionType: 'print_mode', optionValue, optionLabel }));
  (spec.shapes || []).forEach(([optionValue, optionLabel]) => rows.push({ optionType: 'shape', optionValue, optionLabel }));
  return rows;
}

function createTemplate(id, productId, templateName, spec) {
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

const MATERIAL_COATED = ['1', '铜版纸'];
const MATERIAL_PET = ['2', 'PET / 透明膜'];
const MATERIAL_PP = ['3', 'PP 合成膜'];
const MATERIAL_SILVER = ['4', '哑银 PET'];
const MATERIAL_FRAGILE = ['5', '防伪易碎纸'];

const PROCESS_LAMINATION = ['lamination', '覆膜'];
const PROCESS_DIE_CUT = ['die_cut', '模切'];
const PROCESS_UV = ['uv', '局部 UV'];
const PROCESS_HOT_STAMP = ['hot_stamp', '烫金'];
const PROCESS_VARIABLE = ['variable_data', '可变二维码'];
const PROCESS_PROOFING = ['proofing', '打样'];

const PRINT_FOUR_COLOR = ['four_color', '四色印刷'];
const PRINT_SINGLE_COLOR = ['single_color', '单色印刷'];
const PRINT_WHITE = ['white_ink', '四色 + 白墨'];

const SHAPE_RECTANGLE = ['rectangle', '矩形'];
const SHAPE_CUSTOM = ['custom', '异形'];

const templateSpecs = [
  ['1', '1', '不干胶标签标准报价模板', [MATERIAL_COATED, MATERIAL_PET], [PROCESS_LAMINATION, PROCESS_DIE_CUT, PROCESS_PROOFING]],
  ['2', '2', '卷标标签批量报价模板', [MATERIAL_COATED, MATERIAL_PP], [PROCESS_LAMINATION, PROCESS_DIE_CUT, PROCESS_PROOFING]],
  ['3', '3', '食品饮料标签报价模板', [MATERIAL_COATED, MATERIAL_PET], [PROCESS_LAMINATION, PROCESS_DIE_CUT, PROCESS_PROOFING]],
  ['4', '4', '日化美妆标签报价模板', [MATERIAL_PET, MATERIAL_PP], [PROCESS_LAMINATION, PROCESS_HOT_STAMP, PROCESS_UV, PROCESS_DIE_CUT]],
  ['5', '5', '医药保健标签报价模板', [MATERIAL_COATED], [PROCESS_LAMINATION, PROCESS_DIE_CUT, PROCESS_PROOFING]],
  ['6', '6', '工业电子标签报价模板', [MATERIAL_SILVER, MATERIAL_PET], [PROCESS_LAMINATION, PROCESS_DIE_CUT, PROCESS_PROOFING]],
  ['7', '7', '防伪标签报价模板', [MATERIAL_FRAGILE, MATERIAL_PET], [PROCESS_DIE_CUT, PROCESS_VARIABLE, PROCESS_PROOFING]],
  ['8', '8', '可变二维码标签报价模板', [MATERIAL_COATED, MATERIAL_PET], [PROCESS_VARIABLE, PROCESS_DIE_CUT, PROCESS_PROOFING]],
  ['9', '9', '产品说明书报价模板', [MATERIAL_COATED], [PROCESS_DIE_CUT]],
  ['10', '10', '包装盒宣传册报价模板', [MATERIAL_COATED], [PROCESS_LAMINATION, PROCESS_HOT_STAMP, PROCESS_UV]],
];

const templates = templateSpecs.map(([id, productId, name, materials, processes], index) =>
  createTemplate(id, productId, name, {
    widthMin: 20,
    widthMax: index > 7 ? 500 : 420,
    heightMin: 20,
    heightMax: index > 7 ? 600 : 420,
    quantityMin: index > 7 ? 100 : 500,
    quantityMax: index > 7 ? 50000 : 300000,
    minPrice: index > 7 ? 500 : 220,
    allowProofing: true,
    allowLamination: true,
    allowUv: true,
    allowDieCut: true,
    allowCustomShape: true,
    materials,
    processes,
    printModes: [PRINT_FOUR_COLOR, PRINT_SINGLE_COLOR, PRINT_WHITE],
    shapes: [SHAPE_RECTANGLE, SHAPE_CUSTOM],
  }),
);

const sampleProducts = [
  ['1', '1', '不干胶标签', '适用于食品、日化、工业等多场景标签印刷。'],
  ['2', '2', '卷标标签', '适合自动贴标和批量生产，交付稳定。'],
  ['3', '3', '食品饮料标签', '耐冷藏、防潮，贴合瓶罐和外包装。'],
  ['4', '4', '日化美妆标签', '支持透明膜、烫金和局部 UV，提升货架质感。'],
  ['5', '5', '医药保健标签', '信息清晰、批量一致，适合药盒和瓶贴。'],
  ['6', '6', '工业电子标签', '耐磨耐候，适合设备铭牌和参数标签。'],
  ['7', '7', '防伪标签', '适合封口、防拆、防伪和渠道管控。'],
  ['8', '8', '可变二维码标签', '支持一物一码、溯源、防伪和营销活动。'],
  ['9', '9', '产品说明书', '折页、说明书、随箱资料配套印刷。'],
  ['10', '10', '包装盒 / 宣传册印刷', '品牌包装与宣传资料配套生产。'],
].map(([id, categoryId, name, description], index) => ({
  id,
  categoryId,
  name,
  code: `LC-${String(index + 1).padStart(3, '0')}`,
  description,
  applicationScenario: description,
  isHot: index < 6,
  sort: (index + 1) * 10,
  status: 'active',
  templates: [templates[index]],
}));

const sampleTemplates = sampleProducts.flatMap((product) =>
  (product.templates || []).map((template) => ({ ...template, product })),
);

module.exports = {
  sampleCategories,
  sampleProducts,
  sampleTemplates,
};
