const { normalizeProduct, request } = require('../../utils/api');
const { sampleProducts } = require('../../utils/sample-data');

Page({
  data: {
    loading: true,
    error: '',
    product: null,
    gallery: [],
    templates: [],
  },

  onLoad(query) {
    const id = query && query.id;
    if (!id) {
      this.setData({ loading: false, error: '缺少产品 ID' });
      return;
    }
    this.load(id);
  },

  load(id) {
    this.setData({ loading: true, error: '' });
    request(`/catalog/products/${id}`)
      .then((product) => {
        this.applyProduct(normalizeProduct(product));
      })
      .catch(() => {
        const fallback = sampleProducts.find((item) => String(item.id) === String(id));
        if (fallback) {
          this.applyProduct(normalizeProduct(fallback));
        } else {
          this.setData({ loading: false, error: '产品不存在或已下架' });
        }
      });
  },

  applyProduct(product) {
    const gallery = Array.isArray(product.galleryJson) ? product.galleryJson : [];
    this.setData({
      loading: false,
      product,
      gallery,
      templates: product.templates || [],
    });
  },

  gotoQuote() {
    if (!this.data.product) {
      return;
    }
    wx.setStorageSync('yinshua_quote_product', this.data.product.id);
    wx.switchTab({ url: '/pages/quote/index' });
  },

  back() {
    wx.navigateBack({ fail: () => wx.switchTab({ url: '/pages/index/index' }) });
  },
});
