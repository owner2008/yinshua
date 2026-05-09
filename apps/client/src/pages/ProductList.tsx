import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PageHero } from '../components/PageHero';
import { H5PageChrome, H5TabBar } from '../components/H5Chrome';
import { ProductVisual } from '../components/PrintingVisuals';
import { SectionHeading } from '../components/cards';
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
    <div className="lc-subpage">
      <H5PageChrome title="产品中心" subtitle="标签、卷标、包装印刷与一物一码产品快速浏览" />
      <PageHero
        kicker="Product Center"
        title="产品中心"
        desc="覆盖不干胶标签、卷标标签、防伪标签、可变二维码、产品说明书与包装印刷，支持按行业和工艺快速筛选。"
      >
        <div className="lc-page-stat">
          <strong>{filteredProducts.length}</strong>
          <span>可选产品</span>
        </div>
      </PageHero>

      <section className="lc-section">
        <div className="lc-container">
          <SectionHeading kicker="Categories" title="按标签类型快速筛选" />
          <div className="lc-chip-filter">
            <button type="button" className={!activeCategory ? 'active' : ''} onClick={() => setParams({})}>
              全部
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
            <div className="lc-empty-state lc-card">
              <h3>该分类暂无产品</h3>
              <p>可以切换其他分类，或直接提交定制需求，我们会按材质、尺寸和数量提供报价建议。</p>
              <Link className="lc-button primary" to="/quote">
                提交定制需求
              </Link>
            </div>
          ) : (
            <div className="lc-grid-3 lc-subpage-product-grid">
              {filteredProducts.map((product, index) => (
                <article className="lc-card lc-product-card" key={product.id}>
                  <ProductVisual product={product} tone={index % 4} />
                  <span className="lc-card-kicker">{product.category?.name ?? '标签印刷'}</span>
                  <h3>{product.name}</h3>
                  <p>{product.applicationScenario ?? product.description ?? '适合企业产品包装、识别、防伪与物流管理。'}</p>
                  <div className="lc-card-actions">
                    <Link to={`/products/${product.id}`}>查看详情</Link>
                    <Link to={`/quote?productId=${product.id}`}>按此报价</Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
      <H5TabBar />
    </div>
  );
}
