const { request } = require('../../utils/api');
const { sampleCategories, sampleProducts } = require('../../utils/sample-data');

Page({
  data: {
    notice: '正在加载首页',
    categories: sampleCategories,
    hotProducts: sampleProducts.filter((item) => item.isHot).slice(0, 4),
    latestProducts: sampleProducts.slice(0, 6)
  },

  onShow() {
    this.loadHome();
  },

  loadHome() {
    this.setData({ notice: '正在加载首页' });
    request('/catalog/home')
      .then((data) => {
        const categories = (data && data.categories) || sampleCategories;
        const hotProducts = (data && data.hotProducts) || sampleProducts.filter((item) => item.isHot);
        const latestProducts = (data && data.latestProducts) || sampleProducts;
        this.setData({
          categories: categories.length ? categories : sampleCategories,
          hotProducts: (hotProducts.length ? hotProducts : sampleProducts).slice(0, 6),
          latestProducts: (latestProducts.length ? latestProducts : sampleProducts).slice(0, 8),
          notice: '产品目录已同步'
        });
      })
      .catch(() => {
        this.setData({
          categories: sampleCategories,
          hotProducts: sampleProducts.filter((item) => item.isHot).slice(0, 4),
          latestProducts: sampleProducts.slice(0, 6),
          notice: '使用内置样例数据'
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
  }
});
