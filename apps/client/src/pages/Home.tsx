import { Link } from 'react-router-dom';
import { useCatalog } from '../catalogContext';
import type { Product } from '../types';

export function HomePage() {
  const { home, categories, products, loading } = useCatalog();
  const hotProducts = home?.hotProducts ?? products.filter((item) => item.isHot).slice(0, 4);
  const latestProducts =
    home?.latestProducts && home.latestProducts.length > 0
      ? home.latestProducts.slice(0, 6)
      : products.slice(0, 6);

  return (
    <div className="home-view">
      <section className="hero panel">
        <div>
          <p className="eyebrow">不干胶印刷</p>
          <h1>参数化在线报价</h1>
          <p>从产品选择到报价明细，全流程后端统一计算，后台可配置价格与规则。</p>
          <div className="action-bar">
            <Link className="primary" to="/products">浏览产品</Link>
            <Link to="/quote">直接报价</Link>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="section-title">
          <h2>产品分类</h2>
          <Link to="/products">全部产品</Link>
        </div>
        <div className="chip-row">
          {categories.map((category) => (
            <Link key={category.id} to={`/products?category=${category.id}`} className="chip">
              {category.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="section-title">
          <h2>热门产品</h2>
          <span>{loading ? '加载中…' : `${hotProducts.length} 款`}</span>
        </div>
        <ProductGrid products={hotProducts} />
      </section>

      <section className="panel">
        <div className="section-title">
          <h2>最新上架</h2>
          <Link to="/products">查看全部</Link>
        </div>
        <ProductGrid products={latestProducts} />
      </section>
    </div>
  );
}

function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return <p className="empty-copy">暂无产品</p>;
  }
  return (
    <div className="product-grid">
      {products.map((product, index) => (
        <Link key={product.id} to={`/products/${product.id}`} className="product-card-link">
          <div className="product-card">
            <ProductThumb product={product} tone={index % 3} />
            <strong>{product.name}</strong>
            <small>{product.applicationScenario ?? '可按需定制'}</small>
          </div>
        </Link>
      ))}
    </div>
  );
}

function ProductThumb({ product, tone }: { product: Product; tone: number }) {
  if (product.coverImage) {
    return <img className="product-image product-cover" src={product.coverImage} alt={product.name} loading="lazy" />;
  }

  return <span className={`product-image tone-${tone}`} />;
}
