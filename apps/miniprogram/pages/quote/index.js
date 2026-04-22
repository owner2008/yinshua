const { loginMember, post, request } = require('../../utils/api');
const { sampleProducts, sampleTemplates } = require('../../utils/sample-data');

const customerTypes = [
  { label: '个人客户', value: 'personal' },
  { label: '企业客户', value: 'company' }
];

Page({
  data: {
    busy: false,
    notice: '正在读取产品配置',
    products: sampleProducts,
    templates: sampleTemplates,
    selectedProductId: 1,
    selectedTemplateIndex: 0,
    selectedMaterialIndex: 0,
    selectedPrintIndex: 0,
    selectedShapeIndex: 0,
    selectedCustomerTypeIndex: 1,
    customerTypeLabels: customerTypes.map((item) => item.label),
    selectedTemplate: sampleTemplates[0],
    templateNames: [],
    materialLabels: [],
    printLabels: [],
    shapeLabels: [],
    selectedMaterialLabel: '',
    selectedPrintLabel: '',
    selectedShapeLabel: '',
    selectedCustomerTypeLabel: customerTypes[1].label,
    processOptions: [],
    quoteInput: createDefaultQuote(sampleProducts[0], sampleTemplates[0]),
    quoteResult: null
  },

  onLoad() {
    this.loadCatalog();
    loginMember().catch((error) => this.setData({ notice: error.message }));
  },

  loadCatalog() {
    this.setData({ busy: true, notice: '正在读取产品配置' });
    Promise.all([request('/admin/products'), request('/admin/product-templates')])
      .then(([remoteProducts, remoteTemplates]) => {
        const products = remoteProducts && remoteProducts.length ? remoteProducts : sampleProducts;
        const templates = remoteTemplates && remoteTemplates.length ? remoteTemplates : sampleTemplates;
        this.applyCatalog(products, templates, '产品配置已同步');
      })
      .catch(() => {
        this.applyCatalog(sampleProducts, sampleTemplates, '使用内置样例配置');
      })
      .finally(() => this.setData({ busy: false }));
  },

  applyCatalog(products, templates, notice) {
    const firstProduct = products[0];
    const firstTemplate = templates.find((item) => Number(item.productId) === Number(firstProduct && firstProduct.id)) || templates[0];
    const quoteInput = createDefaultQuote(firstProduct, firstTemplate);
    this.setData({
      products,
      templates,
      selectedProductId: Number(firstProduct && firstProduct.id || 1),
      selectedTemplateIndex: 0,
      quoteInput,
      quoteResult: null,
      notice
    });
    this.refreshOptions();
  },

  refreshOptions() {
    const productTemplates = this.data.templates.filter((item) => Number(item.productId) === Number(this.data.selectedProductId));
    const selectedTemplate = productTemplates[this.data.selectedTemplateIndex] || productTemplates[0] || this.data.templates[0];
    const options = getTemplateOptions(selectedTemplate);
    const selectedMaterial = options.materials[this.data.selectedMaterialIndex] || options.materials[0] || {};
    const selectedPrint = options.printModes[this.data.selectedPrintIndex] || options.printModes[0] || {};
    const selectedShape = options.shapes[this.data.selectedShapeIndex] || options.shapes[0] || {};
    const quoteInput = {
      ...this.data.quoteInput,
      productTemplateId: Number(selectedTemplate && selectedTemplate.id || 1),
      materialId: Number(selectedMaterial.optionValue || 2),
      printMode: selectedPrint.optionValue || 'four_color',
      shapeType: selectedShape.optionValue || 'rectangle'
    };
    this.setData({
      selectedTemplate,
      templateNames: productTemplates.map((item) => item.templateName),
      materialLabels: options.materials.map((item) => item.optionLabel),
      printLabels: options.printModes.map((item) => item.optionLabel),
      shapeLabels: options.shapes.map((item) => item.optionLabel),
      selectedMaterialLabel: selectedMaterial.optionLabel || '',
      selectedPrintLabel: selectedPrint.optionLabel || '',
      selectedShapeLabel: selectedShape.optionLabel || '',
      processOptions: options.processes.map((item) => ({
        ...item,
        selected: quoteInput.processCodes.includes(item.optionValue)
      })),
      quoteInput
    });
  },

  selectProduct(event) {
    const selectedProductId = Number(event.currentTarget.dataset.id);
    const product = this.data.products.find((item) => Number(item.id) === selectedProductId);
    const template = this.data.templates.find((item) => Number(item.productId) === selectedProductId) || this.data.templates[0];
    this.setData({
      selectedProductId,
      selectedTemplateIndex: 0,
      selectedMaterialIndex: 0,
      selectedPrintIndex: 0,
      selectedShapeIndex: 0,
      quoteInput: createDefaultQuote(product, template),
      quoteResult: null
    });
    this.refreshOptions();
  },

  changeTemplate(event) {
    const selectedTemplateIndex = Number(event.detail.value);
    const productTemplates = this.data.templates.filter((item) => Number(item.productId) === Number(this.data.selectedProductId));
    const template = productTemplates[selectedTemplateIndex] || productTemplates[0];
    const product = this.data.products.find((item) => Number(item.id) === Number(this.data.selectedProductId));
    this.setData({
      selectedTemplateIndex,
      selectedMaterialIndex: 0,
      selectedPrintIndex: 0,
      selectedShapeIndex: 0,
      quoteInput: createDefaultQuote(product, template),
      quoteResult: null
    });
    this.refreshOptions();
  },

  changeNumber(event) {
    this.setData({
      [`quoteInput.${event.currentTarget.dataset.field}`]: Number(event.detail.value)
    });
  },

  changeBoolean(event) {
    this.setData({
      [`quoteInput.${event.currentTarget.dataset.field}`]: event.detail.value
    });
  },

  changeMaterial(event) {
    const selectedMaterialIndex = Number(event.detail.value);
    this.setData({ selectedMaterialIndex });
    this.refreshOptions();
  },

  changePrint(event) {
    const selectedPrintIndex = Number(event.detail.value);
    this.setData({ selectedPrintIndex });
    this.refreshOptions();
  },

  changeShape(event) {
    const selectedShapeIndex = Number(event.detail.value);
    this.setData({ selectedShapeIndex });
    this.refreshOptions();
  },

  changeCustomerType(event) {
    const selectedCustomerTypeIndex = Number(event.detail.value);
    this.setData({
      selectedCustomerTypeIndex,
      selectedCustomerTypeLabel: customerTypes[selectedCustomerTypeIndex].label,
      'quoteInput.customerType': customerTypes[selectedCustomerTypeIndex].value
    });
  },

  toggleProcess(event) {
    const code = event.currentTarget.dataset.code;
    const current = this.data.quoteInput.processCodes;
    const next = current.includes(code) ? current.filter((item) => item !== code) : [...current, code];
    this.setData({ 'quoteInput.processCodes': next });
    this.refreshOptions();
  },

  calculate() {
    this.setData({ busy: true, notice: '正在计算报价' });
    post('/quotes/calculate', normalizeQuoteInput(this.data.quoteInput))
      .then((quoteResult) => this.setData({ quoteResult, notice: '报价已生成' }))
      .catch((error) => {
        wx.showToast({ title: error.message, icon: 'none' });
        this.setData({ notice: '报价失败' });
      })
      .finally(() => this.setData({ busy: false }));
  },

  saveQuote() {
    this.setData({ busy: true, notice: '正在保存报价' });
    loginMember()
      .then(() => post('/quotes', normalizeQuoteInput(this.data.quoteInput)))
      .then((quoteResult) => {
        this.setData({ quoteResult, notice: `报价单 ${quoteResult.quoteNo} 已保存` });
        wx.showToast({ title: '保存成功', icon: 'success' });
      })
      .catch((error) => {
        wx.showToast({ title: error.message, icon: 'none' });
        this.setData({ notice: '保存失败' });
      })
      .finally(() => this.setData({ busy: false }));
  }
});

function createDefaultQuote(product, template) {
  const options = getTemplateOptions(template);
  const firstMaterial = options.materials[0] || {};
  const firstPrint = options.printModes[0] || {};
  const firstShape = options.shapes[0] || {};
  return {
    productId: Number(product && product.id || template && template.productId || 1),
    productTemplateId: Number(template && template.id || 1),
    widthMm: clamp(100, Number(template && template.widthMin || 20), Number(template && template.widthMax || 500)),
    heightMm: clamp(80, Number(template && template.heightMin || 20), Number(template && template.heightMax || 500)),
    quantity: clamp(5000, Number(template && template.quantityMin || 100), Number(template && template.quantityMax || 100000)),
    materialId: Number(firstMaterial.optionValue || 2),
    printMode: firstPrint.optionValue || 'four_color',
    shapeType: firstShape.optionValue || 'rectangle',
    processCodes: options.processes.slice(0, 2).map((item) => item.optionValue),
    isProofing: false,
    isUrgent: false,
    customerType: 'company'
  };
}

function normalizeQuoteInput(input) {
  return {
    ...input,
    productId: Number(input.productId),
    productTemplateId: Number(input.productTemplateId),
    widthMm: Number(input.widthMm),
    heightMm: Number(input.heightMm),
    quantity: Number(input.quantity),
    materialId: Number(input.materialId),
    processCodes: input.isProofing && !input.processCodes.includes('proofing')
      ? [...input.processCodes, 'proofing']
      : input.processCodes
  };
}

function getTemplateOptions(template) {
  const options = template && template.options && template.options.length ? template.options : sampleTemplates[0].options || [];
  return {
    materials: options.filter((item) => item.optionType === 'material'),
    processes: options.filter((item) => item.optionType === 'process'),
    printModes: options.filter((item) => item.optionType === 'print_mode'),
    shapes: options.filter((item) => item.optionType === 'shape')
  };
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
