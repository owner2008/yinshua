const { loginMember, request } = require('../../utils/api');

Page({
  data: {
    busy: false,
    notice: '正在读取历史报价',
    quotes: []
  },

  onShow() {
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
          notice: normalized.length ? `共 ${normalized.length} 条历史报价` : '暂无历史报价'
        });
      })
      .catch((error) => {
        wx.showToast({ title: error.message, icon: 'none' });
        this.setData({ notice: '历史报价读取失败' });
      })
      .finally(() => this.setData({ busy: false }));
  },

  openQuote(event) {
    const id = event.currentTarget.dataset.id;
    wx.showToast({ title: `报价 #${id}`, icon: 'none' });
  },

  goQuote() {
    wx.switchTab({ url: '/pages/quote/index' });
  }
});

function normalizeQuote(quote) {
  const snapshot = getSnapshot(quote);
  const summary = quote.summary || snapshot.summary || {};
  const input = snapshot.input || quote.input || quote || {};
  const product = quote.product || {};
  return {
    id: quote.id,
    quoteNo: quote.quoteNo || `#${quote.id}`,
    productName: quote.productName || product.name || snapshot.productName || '不干胶产品',
    quantity: Number(input.quantity || quote.quantity || 0),
    customerTypeText: (input.customerType || quote.customerType) === 'personal' ? '个人客户' : '企业客户',
    finalPrice: formatMoney(summary.finalPrice || quote.finalPrice || 0),
    createdAtText: formatDate(quote.createdAt)
  };
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
