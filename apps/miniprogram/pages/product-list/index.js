const { request } = require('../../utils/api');
const { sampleCategories, sampleProducts } = require('../../utils/sample-data');

Page({
  data: {
    notice: '',
    categories: sampleCategories,
    products: sampleProducts,
    activeCategory: ''
  },

  onLoad(query) {
    const activeCategory = query && query.category ? String(query.category) : '';
    this.setData({ activeCategory });
    this.loadCategories();
    this.loadProducts(activeCategory);
  },

  loadCategories() {
    request('/catalog/categories')
      .then((list) => {
        this.setData({ categories: list && list.length ? list : sampleCategories });
      })
      .catch(() => {
        this.setData({ categories: sampleCategories });
      });
  },

  loadProducts(categoryId) {
    const suffix = categoryId ? `?categoryId=${categoryId}` : '';
    this.setData({ notice: '加载中' });
    request(`/catalog/products${suffix}`)
      .then((list) => {
        const next = list && list.length ? list : filterSample(categoryId);
        this.setData({ products: next, notice: next.length ? '' : '暂无产品' });
      })
      .catch(() => {
        const next = filterSample(categoryId);
        this.setData({ products: next, notice: next.length ? '使用样例数据' : '暂无产品' });
      });
  },

  selectCategory(event) {
    const categoryId = event.currentTarget.dataset.id || '';
    this.setData({ activeCategory: String(categoryId) });
    this.loadProducts(categoryId);
  },

  openDetail(event) {
    const id = event.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/product-detail/index?id=${id}` });
  }
});

function filterSample(categoryId) {
  if (!categoryId) {
    return sampleProducts;
  }
  return sampleProducts.filter((item) => String(item.categoryId) === String(categoryId));
}
