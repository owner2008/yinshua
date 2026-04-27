const { applyStoredThemeMode, loginMember, post, refreshThemeMode, request } = require('../../utils/api');
const { sampleProducts, sampleTemplates } = require('../../utils/sample-data');

const customerTypes = [
  { label: '个人客户', value: 'personal' },
  { label: '企业客户', value: 'company' },
];
const requirementOptions = {
  deliveryForm: ['卷装', '张装', '单张裁切', '折叠 / 风琴折'],
  labelingMethod: ['手工贴标', '自动贴标', '半自动贴标'],
  rollDirection: ['上出', '下出', '左出', '右出', '内卷', '外卷'],
  adhesiveType: ['永久胶', '可移胶', '强粘胶', '冷冻胶', '耐高温胶'],
  surfaceFinish: ['哑膜', '亮膜', '哑油', '光油', '防刮', '防水', '白墨打底'],
  colorMode: ['四色印刷', '单黑', '专色', '四色 + 白墨', '可变数据 / 条码'],
};

Page({
  data: {
    themeMode: 'graphite',
    busy: false,
    notice: '正在读取产品配置',
    products: sampleProducts,
    templates: sampleTemplates,
    pendingQuoteProductId: null,
    selectedProductId: Number(sampleProducts[0].id),
    selectedProductAnchor: getProductAnchor(sampleProducts[0].id),
    selectedTemplateIndex: 0,
    selectedMaterialIndex: 0,
    selectedPrintIndex: 0,
    selectedShapeIndex: 0,
    selectedCustomerTypeIndex: 1,
    customerTypeLabels: customerTypes.map((item) => item.label),
    requirementOptions,
    selectedTemplate: sampleTemplates[0] || null,
    templateNames: [],
    materialLabels: [],
    printLabels: [],
    shapeLabels: [],
    selectedMaterialLabel: '',
    selectedPrintLabel: '',
    selectedShapeLabel: '',
    selectedCustomerTypeLabel: customerTypes[1].label,
    processOptions: [],
    hasTemplate: Boolean(sampleTemplates[0]),
    quoteInput: sampleTemplates[0] ? createDefaultQuote(sampleProducts[0], sampleTemplates[0]) : null,
    quoteResult: null,
  },

  onLoad() {
    applyStoredThemeMode(this);
    void refreshThemeMode(this);
    const hinted = getStoredQuoteProductId();
    if (hinted) {
      this.setData({
        pendingQuoteProductId: hinted,
        selectedProductId: hinted,
        selectedProductAnchor: getProductAnchor(hinted),
      });
      this.applySelectedProduct(hinted);
    }
    this.loadCatalog();
    loginMember().catch((error) => this.setData({ notice: error.message }));
  },

  onShow() {
    const hinted = getStoredQuoteProductId();
    if (!hinted) {
      return;
    }
    this.applySelectedProduct(hinted);
  },

  applySelectedProduct(productId) {
    const selectedProductId = Number(productId);
    const product = this.data.products.find((item) => Number(item.id) === selectedProductId);
    if (!product) {
      this.setData({
        pendingQuoteProductId: selectedProductId,
        selectedProductId,
        selectedProductAnchor: getProductAnchor(selectedProductId),
      });
      return;
    }
    const template = this.data.templates.find((item) => Number(item.productId) === selectedProductId) || null;
    this.setData(
      {
        pendingQuoteProductId: selectedProductId,
        selectedProductId,
        selectedProductAnchor: getProductAnchor(selectedProductId),
        selectedTemplateIndex: 0,
        selectedMaterialIndex: 0,
        selectedPrintIndex: 0,
        selectedShapeIndex: 0,
        quoteInput: createDefaultQuote(product, template),
        quoteResult: null,
      },
      () => this.refreshOptions(),
    );
  },

  loadCatalog() {
    this.setData({ busy: true, notice: '正在读取产品配置' });
    Promise.all([request('/catalog/products'), request('/admin/product-templates')])
      .then(([remoteProducts, remoteTemplates]) => {
        const products = remoteProducts && remoteProducts.length ? remoteProducts : sampleProducts;
        const templates = remoteTemplates && remoteTemplates.length ? remoteTemplates : sampleTemplates;
        this.applyCatalog(products, templates, '产品配置已同步');
      })
      .catch(() => {
        this.applyCatalog(sampleProducts, sampleTemplates, '当前使用内置示例配置');
      })
      .finally(() => this.setData({ busy: false }));
  },

  applyCatalog(products, templates, notice) {
    const firstProduct = products[0];
    const targetProductId = this.data.pendingQuoteProductId || this.data.selectedProductId;
    const selectedProduct = products.find((item) => Number(item.id) === Number(targetProductId)) || firstProduct;
    const firstTemplate = templates.find((item) => Number(item.productId) === Number(selectedProduct && selectedProduct.id));
    this.setData(
      {
        products,
        templates,
        pendingQuoteProductId: null,
        selectedProductId: Number((selectedProduct && selectedProduct.id) || 1),
        selectedProductAnchor: getProductAnchor((selectedProduct && selectedProduct.id) || 1),
        selectedTemplateIndex: 0,
        selectedMaterialIndex: 0,
        selectedPrintIndex: 0,
        selectedShapeIndex: 0,
        quoteInput: firstTemplate ? createDefaultQuote(selectedProduct, firstTemplate) : null,
        quoteResult: null,
        notice,
      },
      () => this.refreshOptions(),
    );
    wx.removeStorageSync('yinshua_quote_product');
  },

  refreshOptions() {
    const productTemplates = this.data.templates.filter(
      (item) => Number(item.productId) === Number(this.data.selectedProductId),
    );
    const selectedTemplate = productTemplates[this.data.selectedTemplateIndex] || productTemplates[0] || null;
    if (!selectedTemplate) {
      this.setData({
        selectedTemplate: null,
        templateNames: [],
        materialLabels: [],
        printLabels: [],
        shapeLabels: [],
        selectedMaterialLabel: '',
        selectedPrintLabel: '',
        selectedShapeLabel: '',
        processOptions: [],
        hasTemplate: false,
      });
      return;
    }
    const options = getTemplateOptions(selectedTemplate);
    const materialIdx = Math.min(this.data.selectedMaterialIndex, Math.max(0, options.materials.length - 1));
    const printIdx = Math.min(this.data.selectedPrintIndex, Math.max(0, options.printModes.length - 1));
    const shapeIdx = Math.min(this.data.selectedShapeIndex, Math.max(0, options.shapes.length - 1));
    const selectedMaterial = options.materials[materialIdx] || {};
    const selectedPrint = options.printModes[printIdx] || {};
    const selectedShape = options.shapes[shapeIdx] || {};
    const quoteInput = {
      ...(this.data.quoteInput || {}),
      productTemplateId: Number(selectedTemplate.id),
      materialId: Number(selectedMaterial.optionValue || 0),
      printMode: selectedPrint.optionValue || '',
      shapeType: selectedShape.optionValue || '',
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
      selectedMaterialIndex: materialIdx,
      selectedPrintIndex: printIdx,
      selectedShapeIndex: shapeIdx,
      processOptions: options.processes.map((item) => ({
        ...item,
        selected: (quoteInput.processCodes || []).includes(item.optionValue),
      })),
      quoteInput,
      hasTemplate: true,
    });
  },

  selectProduct(event) {
    const selectedProductId = Number(event.currentTarget.dataset.id);
    const product = this.data.products.find((item) => Number(item.id) === selectedProductId);
    const template = this.data.templates.find((item) => Number(item.productId) === selectedProductId) || null;
    this.setData({
      pendingQuoteProductId: null,
      selectedProductId,
      selectedProductAnchor: getProductAnchor(selectedProductId),
      selectedTemplateIndex: 0,
      selectedMaterialIndex: 0,
      selectedPrintIndex: 0,
      selectedShapeIndex: 0,
      quoteInput: template ? createDefaultQuote(product, template) : null,
      quoteResult: null,
    });
    this.refreshOptions();
  },

  changeTemplate(event) {
    const selectedTemplateIndex = Number(event.detail.value);
    const productTemplates = this.data.templates.filter(
      (item) => Number(item.productId) === Number(this.data.selectedProductId),
    );
    const template = productTemplates[selectedTemplateIndex] || productTemplates[0];
    const product = this.data.products.find((item) => Number(item.id) === Number(this.data.selectedProductId));
    if (!template) {
      return;
    }
    this.setData({
      selectedTemplateIndex,
      selectedMaterialIndex: 0,
      selectedPrintIndex: 0,
      selectedShapeIndex: 0,
      quoteInput: createDefaultQuote(product, template),
      quoteResult: null,
    });
    this.refreshOptions();
  },

  changeNumber(event) {
    this.setData({
      [`quoteInput.${event.currentTarget.dataset.field}`]: Number(event.detail.value),
    });
  },

  changeBoolean(event) {
    this.setData({
      [`quoteInput.${event.currentTarget.dataset.field}`]: event.detail.value,
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
      'quoteInput.customerType': customerTypes[selectedCustomerTypeIndex].value,
    });
  },

  changeRequirementPicker(event) {
    const field = event.currentTarget.dataset.field;
    const value = requirementOptions[field][Number(event.detail.value)] || '';
    this.setData({
      [`quoteInput.${field}`]: value,
    });
  },

  changeText(event) {
    this.setData({
      [`quoteInput.${event.currentTarget.dataset.field}`]: event.detail.value,
    });
  },

  toggleProcess(event) {
    if (!this.data.quoteInput) {
      return;
    }
    const code = event.currentTarget.dataset.code;
    const current = this.data.quoteInput.processCodes || [];
    const next = current.includes(code) ? current.filter((item) => item !== code) : [...current, code];
    this.setData({ 'quoteInput.processCodes': next });
    this.refreshOptions();
  },

  calculate() {
    if (!this.data.quoteInput) {
      wx.showToast({ title: '当前产品暂无报价模板', icon: 'none' });
      return;
    }
    this.setData({ busy: true, notice: '正在计算报价' });
    post('/quotes/calculate', normalizeQuoteInput(this.data.quoteInput))
      .then((quoteResult) => this.setData({ quoteResult: enrichQuoteResult(quoteResult), notice: '报价已生成' }))
      .catch((error) => {
        wx.showToast({ title: error.message, icon: 'none' });
        this.setData({ notice: '报价失败' });
      })
      .finally(() => this.setData({ busy: false }));
  },

  saveQuote() {
    if (!this.data.quoteInput) {
      wx.showToast({ title: '当前产品暂无报价模板', icon: 'none' });
      return;
    }
    this.setData({ busy: true, notice: '正在保存报价' });
    loginMember()
      .then(() => post('/quotes', normalizeQuoteInput(this.data.quoteInput)))
      .then((quoteResult) => {
        this.setData({ quoteResult: enrichQuoteResult(quoteResult), notice: `报价单 ${quoteResult.quoteNo} 已保存` });
        wx.showToast({ title: '保存成功', icon: 'success' });
      })
      .catch((error) => {
        wx.showToast({ title: error.message, icon: 'none' });
        this.setData({ notice: '保存失败' });
      })
      .finally(() => this.setData({ busy: false }));
  },
});

function createDefaultQuote(product, template) {
  if (!template) {
    return null;
  }
  const options = getTemplateOptions(template);
  const firstMaterial = options.materials[0] || {};
  const firstPrint = options.printModes[0] || {};
  const firstShape = options.shapes[0] || {};
  const widthMin = Number(template.widthMin);
  const widthMax = Number(template.widthMax);
  const heightMin = Number(template.heightMin);
  const heightMax = Number(template.heightMax);
  const qtyMin = Number(template.quantityMin);
  const qtyMax = Number(template.quantityMax);
  return {
    productId: Number((product && product.id) || template.productId),
    productTemplateId: Number(template.id),
    widthMm: clamp(Math.round((widthMin + widthMax) / 2), widthMin, widthMax),
    heightMm: clamp(Math.round((heightMin + heightMax) / 2), heightMin, heightMax),
    quantity: clamp(Math.max(1000, qtyMin), qtyMin, qtyMax),
    materialId: Number(firstMaterial.optionValue || 0),
    printMode: firstPrint.optionValue || '',
    shapeType: firstShape.optionValue || '',
    processCodes: options.processes.slice(0, 2).map((item) => item.optionValue),
    isProofing: false,
    isUrgent: false,
    customerType: 'company',
    deliveryForm: '卷装',
    labelingMethod: '手工贴标',
    rollDirection: '上出',
    rollCoreMm: 76,
    piecesPerRoll: 1000,
    adhesiveType: '永久胶',
    surfaceFinish: '哑膜',
    colorMode: '四色印刷',
    usageEnvironment: '',
    hasDesignFile: false,
    needDesignService: false,
    needSampleApproval: true,
    packagingMethod: '',
    expectedDeliveryDate: '',
    quoteRemark: '',
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
    processCodes:
      input.isProofing && !input.processCodes.includes('proofing')
        ? [...input.processCodes, 'proofing']
        : input.processCodes,
  };
}

function enrichQuoteResult(quoteResult) {
  return {
    ...quoteResult,
    feeNotes: getExtraFeeNotes(quoteResult.extraFees || []),
  };
}

function getExtraFeeNotes(extraFees) {
  return extraFees
    .map((fee) => {
      const description = extraFeeDescriptions[fee.code];
      return description ? { code: fee.code, title: fee.name, description } : null;
    })
    .filter(Boolean);
}

const extraFeeDescriptions = {
  white_ink: '透明膜、深色底材或需要遮盖底色时，通常要先铺白墨，会增加开机、油墨和校准成本。',
  variable_data: '流水号、条码、二维码等可变内容需要逐张生成和校验，会增加数据处理与检测成本。',
  protective_finish: '防水、防刮等表面处理会增加涂层或后道处理成本，适合冷藏、潮湿、摩擦频繁等环境。',
  roll_split: '按每卷数量交付时，需要额外复卷、计数和包装，所以会计入分卷整理费用。',
  sheet_cutting: '单张裁切需要额外裁切、点数和整理，适合手工分发或单张贴标场景。',
  fan_fold: '折叠或风琴折交付需要整理成连续折叠形态，适合连续打印或批量贴标场景。',
};

function getTemplateOptions(template) {
  const options = template && Array.isArray(template.options) ? template.options : [];
  return {
    materials: options.filter((item) => item.optionType === 'material'),
    processes: options.filter((item) => item.optionType === 'process'),
    printModes: options.filter((item) => item.optionType === 'print_mode'),
    shapes: options.filter((item) => item.optionType === 'shape'),
  };
}

function getProductAnchor(productId) {
  return `product-${productId}`;
}

function getStoredQuoteProductId() {
  const value = wx.getStorageSync('yinshua_quote_product');
  const productId = Number(value);
  return Number.isFinite(productId) && productId > 0 ? productId : null;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
