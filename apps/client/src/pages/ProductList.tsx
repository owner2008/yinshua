import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCatalog } from '../catalogContext';
import { SectionHeading } from '../components/cards';
import { H5PageChrome, H5TabBar } from '../components/H5Chrome';
import { PageHero } from '../components/PageHero';
import { ProductVisual } from '../components/PrintingVisuals';
import { useI18n } from '../i18n';

export function ProductListPage() {
  const { categories, products } = useCatalog();
  const { t, text } = useI18n();
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
      <H5PageChrome title={t('products.hero.title')} subtitle={t('products.hero.subtitle')} />
      <PageHero kicker={t('products.hero.eyebrow')} title={t('products.hero.title')} desc={t('products.hero.desc')}>
        <div className="lc-page-stat">
          <strong>{filteredProducts.length}</strong>
          <span>{t('products.available')}</span>
        </div>
      </PageHero>

      <section className="lc-section">
        <div className="lc-container">
          <SectionHeading kicker={t('products.categories.eyebrow')} title={t('products.categories.title')} />
          <div className="lc-chip-filter">
            <button type="button" className={!activeCategory ? 'active' : ''} onClick={() => setParams({})}>
              {t('products.filter.all')}
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                className={activeCategory === String(category.id) ? 'active' : ''}
                onClick={() => setParams({ category: String(category.id) })}
              >
                {text(category.name)}
              </button>
            ))}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="lc-empty-state lc-card">
              <h3>{t('products.empty.title')}</h3>
              <p>{t('products.empty.desc')}</p>
              <Link className="lc-button primary" to="/quote">
                {t('products.empty.cta')}
              </Link>
            </div>
          ) : (
            <div className="lc-grid-3 lc-subpage-product-grid">
              {filteredProducts.map((product, index) => (
                <article className="lc-card lc-product-card" key={product.id}>
                  <ProductVisual product={product} tone={index % 4} />
                  <span className="lc-card-kicker">{text(product.category?.name) || t('products.card.categoryFallback')}</span>
                  <h3>{text(product.name)}</h3>
                  <p>{text(product.applicationScenario ?? product.description) || t('products.card.descFallback')}</p>
                  <div className="lc-card-actions">
                    <Link to={`/products/${product.id}`}>{t('common.viewDetails')}</Link>
                    <Link to={`/quote?productId=${product.id}`}>{t('products.card.quote')}</Link>
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
