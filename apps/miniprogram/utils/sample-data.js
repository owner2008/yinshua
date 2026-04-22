const sampleProducts = [
  {
    id: '1',
    name: '透明 PET 标签',
    code: 'PET-LABEL',
    description: '适合瓶身、食品包装、日化贴标等高透明场景。',
    applicationScenario: '日化瓶贴、食品包装、礼盒封签',
    templates: [
      {
        id: '1',
        productId: '1',
        templateName: '透明 PET 标准报价模板',
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
        options: [
          { optionType: 'material', optionValue: '1', optionLabel: '铜版纸' },
          { optionType: 'material', optionValue: '2', optionLabel: '透明 PET' },
          { optionType: 'print_mode', optionValue: 'four_color', optionLabel: '四色印刷' },
          { optionType: 'print_mode', optionValue: 'single_color', optionLabel: '单色印刷' },
          { optionType: 'process', optionValue: 'lamination', optionLabel: '覆膜' },
          { optionType: 'process', optionValue: 'die_cut', optionLabel: '模切' },
          { optionType: 'process', optionValue: 'uv', optionLabel: '局部 UV' },
          { optionType: 'shape', optionValue: 'rectangle', optionLabel: '矩形' },
          { optionType: 'shape', optionValue: 'custom', optionLabel: '异形' }
        ]
      }
    ]
  },
  {
    id: '2',
    name: '哑银不干胶',
    code: 'SILVER-LABEL',
    description: '金属质感强，适合电子、机械铭牌和耐久标签。',
    applicationScenario: '电子铭牌、资产标签、设备标识',
    templates: []
  }
];

const sampleTemplates = sampleProducts.flatMap((product) =>
  (product.templates || []).map((template) => ({ ...template, product }))
);

module.exports = {
  sampleProducts,
  sampleTemplates
};
