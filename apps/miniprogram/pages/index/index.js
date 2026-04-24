const { normalizeHomePayload, request } = require('../../utils/api');
const { sampleCategories, sampleProducts } = require('../../utils/sample-data');

Page({
  data: {
    notice: '正在加载首页',
    branding: null,
    banners: [],
    companyProfile: null,
    categories: sampleCategories,
    equipmentShowcases: [],
    hotProducts: sampleProducts.filter((item) => item.isHot).slice(0, 4),
    latestProducts: sampleProducts.slice(0, 6),
  },

  onShow() {
    this.loadHome();
  },

  loadHome() {
    this.setData({ notice: '正在加载首页' });
    request('/catalog/home')
      .then((payload) => {
        const data = normalizeHomePayload(payload);
        const categories = (data && data.categories) || sampleCategories;
        const hotProducts = (data && data.hotProducts) || sampleProducts.filter((item) => item.isHot);
        const latestProducts = (data && data.latestProducts) || sampleProducts;
        this.setData({
          branding: data.branding || null,
          banners: data.banners || [],
          companyProfile: data.companyProfile || null,
          categories: categories.length ? categories : sampleCategories,
          equipmentShowcases: (data.categoryEquipmentShowcases || []).map(normalizeShowcase),
          hotProducts: (hotProducts.length ? hotProducts : sampleProducts).slice(0, 6),
          latestProducts: (latestProducts.length ? latestProducts : sampleProducts).slice(0, 8),
          notice: data.branding?.headerNotice || '产品目录已同步',
        });
      })
      .catch(() => {
        this.setData({
          branding: null,
          banners: [],
          companyProfile: null,
          categories: sampleCategories,
          equipmentShowcases: [],
          hotProducts: sampleProducts.filter((item) => item.isHot).slice(0, 4),
          latestProducts: sampleProducts.slice(0, 6),
          notice: '使用内置样例数据',
        });
      });
  },

  openCategory(event) {
    const categoryId = event.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/product-list/index?category=${categoryId}` });
  },

  openAllProducts() {
    wx.navigateTo({ url: '/pages/product-list/index' });
  },

  openDetail(event) {
    const id = event.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/product-detail/index?id=${id}` });
  },

  gotoQuote() {
    wx.switchTab({ url: '/pages/quote/index' });
  },

  openBanner(event) {
    const { linkType, linkValue } = event.currentTarget.dataset;
    if (!linkType || linkType === 'none') {
      this.openAllProducts();
      return;
    }
    if (linkType === 'product' && linkValue) {
      wx.navigateTo({ url: `/pages/product-detail/index?id=${linkValue}` });
      return;
    }
    if (linkType === 'category' && linkValue) {
      wx.navigateTo({ url: `/pages/product-list/index?category=${linkValue}` });
      return;
    }
    if (linkType === 'custom' && linkValue) {
      wx.setClipboardData({
        data: String(linkValue),
      });
    }
  },
});

function normalizeShowcase(item) {
  const specsJson = item && item.specsJson && typeof item.specsJson === 'object' ? item.specsJson : {};
  return {
    ...item,
    specsEntries: Object.keys(specsJson)
      .filter((key) => specsJson[key] !== null && specsJson[key] !== '')
      .map((key) => ({
        key,
        value: String(specsJson[key]),
      })),
  };
}
