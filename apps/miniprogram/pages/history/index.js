const { applyStoredThemeMode, loginMember, refreshThemeMode, request } = require('../../utils/api');

Page({
  data: {
    themeMode: 'graphite',
    busy: false,
    notice: '正在读取历史报价',
    quotes: [],
    openedQuoteNo: '',
  },

  onShow() {
    applyStoredThemeMode(this);
    void refreshThemeMode(this);
    this.loadHistory();
  },

  loadHistory() {
    this.setData({ busy: true, notice: '正在读取历史报价' });
    loginMember()
      .then(() => request('/member/quotes'))
      .then((quotes) => {
        const normalized = (quotes || []).map(normalizeQuote);
        this.setData({
          quotes: normalized,
          notice: normalized.length ? `共 ${normalized.length} 条历史报价` : '暂无历史报价',
        });
      })
      .catch((error) => {
        wx.showToast({ title: error.message, icon: 'none' });
        this.setData({ notice: '历史报价读取失败' });
      })
      .finally(() => this.setData({ busy: false }));
  },

  openQuote(event) {
    const quoteNo = event.currentTarget.dataset.quoteNo;
    this.setData({
      openedQuoteNo: this.data.openedQuoteNo === quoteNo ? '' : quoteNo,
    });
  },

  goQuote() {
    wx.switchTab({ url: '/pages/quote/index' });
  },
});

function normalizeQuote(quote) {
  const snapshot = getSnapshot(quote);
  const summary = quote.summary || snapshot.summary || {};
  const input = snapshot.input || quote.input || quote || {};
  const product = quote.product || {};
  return {
    id: quote.id,
    quoteNo: quote.quoteNo || `#${quote.id}`,
    productName: quote.productName || product.name || snapshot.productName || '未命名产品',
    quantity: Number(input.quantity || quote.quantity || 0),
    customerTypeText: (input.customerType || quote.customerType) === 'personal' ? '个人客户' : '企业客户',
    finalPrice: formatMoney(summary.finalPrice || quote.finalPrice || 0),
    createdAtText: formatDate(quote.createdAt),
    requirements: getRequirementItems(input),
    feeNotes: getExtraFeeNotes(snapshot.extraFees || []),
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

const requirementLabels = {
  deliveryForm: '交付形式',
  labelingMethod: '贴标方式',
  rollDirection: '出标方向',
  rollCoreMm: '卷芯内径',
  piecesPerRoll: '每卷数量',
  adhesiveType: '胶性',
  usageEnvironment: '使用环境',
  surfaceFinish: '表面处理',
  colorMode: '印刷颜色',
  hasDesignFile: '已有设计文件',
  designFileUrl: '设计文件地址',
  needDesignService: '需要设计协助',
  needSampleApproval: '需要样稿确认',
  packagingMethod: '包装与发货',
  expectedDeliveryDate: '期望交期',
  quoteRemark: '补充说明',
};

function getRequirementItems(input) {
  return Object.keys(requirementLabels)
    .map((key) => ({
      key,
      label: requirementLabels[key],
      value: formatRequirementValue(key, input[key]),
    }))
    .filter((item) => item.value);
}

function formatRequirementValue(key, value) {
  if (value === undefined || value === null || value === '') {
    return '';
  }
  if (typeof value === 'boolean') {
    return value ? '是' : '否';
  }
  if (key === 'rollCoreMm') {
    return `${value} mm`;
  }
  if (key === 'piecesPerRoll') {
    return `${value} 个/卷`;
  }
  return String(value);
}

function getSnapshot(quote) {
  const snapshot = quote.snapshot || {};
  if (snapshot.fullSnapshotJson && typeof snapshot.fullSnapshotJson === 'object') {
    return snapshot.fullSnapshotJson;
  }
  return snapshot;
}

function formatMoney(value) {
  return Number(value || 0).toFixed(2);
}

function formatDate(value) {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());
  return `${year}-${month}-${day} ${hour}:${minute}`;
}

function pad(value) {
  return value < 10 ? `0${value}` : String(value);
}
