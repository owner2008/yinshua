import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toAssetUrl } from '../api';
import { useCatalog } from '../catalogContext';

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
    <div className="product-list-view">
      <section className="panel">
        <div className="section-title">
          <h2>产品分类</h2>
          <span>{filteredProducts.length} 款产品</span>
        </div>
        <div className="chip-row">
          <button type="button" className={activeCategory ? 'chip' : 'chip selected'} onClick={() => setParams({})}>
            全部
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={activeCategory === String(category.id) ? 'chip selected' : 'chip'}
              onClick={() => setParams({ category: String(category.id) })}
            >
              {category.name}
            </button>
          ))}
        </div>
      </section>

      <section className="panel">
        {filteredProducts.length === 0 ? (
          <p className="empty-copy">该分类下暂时没有产品</p>
        ) : (
          <div className="product-grid">
            {filteredProducts.map((product, index) => (
              <Link key={product.id} to={`/products/${product.id}`} className="product-card-link">
                <div className="product-card">
                  {product.coverImage ? (
                    <img
                      className="product-image product-cover"
                      src={toAssetUrl(product.coverImage)}
                      alt={product.name}
                      loading="lazy"
                    />
                  ) : (
                    <span className={`product-image tone-${index % 3}`} />
                  )}
                  <strong>{product.name}</strong>
                  <small>{product.applicationScenario ?? '支持按需定制'}</small>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
