import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toAssetUrl } from '../api';
import { useCatalog } from '../catalogContext';

const productFallbackImages = [
  '/images/product-label-roll.jpg',
  '/images/product-food-label-roll.jpg',
  '/images/product-packaging-box.jpg',
  '/images/product-handbag.jpg',
  '/images/product-manual.jpg',
  '/images/product-brochure.jpg',
  '/images/product-tape.jpg',
  '/images/product-inner-liner.jpg',
  '/images/product-gift-box.jpg',
];

export function ProductListPage() {
  const { categories, products } = useCatalog();
  const [params, setParams] = useSearchParams();
  const activeCategory = params.get('category');

  const filteredProducts = useMemo(() => {
    if (!activeCategory) {
      return products;
    }
    return products.filter((product) => String(product.categoryId ?? product.category?.id ?? '') === activeCategory);
  }, [products, activeCategory]);

  return (
    <main className="subpage product-center-page">
      <section className="subpage-hero">
        <div>
          <p>Product Center</p>
          <h1>产品中心</h1>
          <span>覆盖标签、不干胶、包装盒、说明书、宣传册与可变数据印刷产品。</span>
        </div>
        <img src="/images/product-label-roll.jpg" alt="产品中心" />
      </section>

      <section className="subpage-section">
        <div className="category-filter-bar">
          <button type="button" className={activeCategory ? '' : 'active'} onClick={() => setParams({})}>
            全部产品
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={activeCategory === String(category.id) ? 'active' : ''}
              onClick={() => setParams({ category: String(category.id) })}
            >
              {category.name}
            </button>
          ))}
        </div>

        {filteredProducts.length === 0 ? (
          <p className="subpage-empty">该分类下暂无产品。</p>
        ) : (
          <div className="subpage-card-grid four product-center-grid">
            {filteredProducts.map((product, index) => (
              <Link key={product.id} to={`/products/${product.id}`} className="product-center-card">
                {product.coverImage ? (
                  <img src={toAssetUrl(product.coverImage)} alt={product.name} loading="lazy" />
                ) : (
                  <img src={productFallbackImages[index % productFallbackImages.length]} alt={product.name} loading="lazy" />
                )}
                <strong>{product.name}</strong>
                <p>{product.applicationScenario ?? product.description ?? '支持按需定制材料、尺寸与工艺。'}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
