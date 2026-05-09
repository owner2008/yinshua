import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchCatalogProduct, toAssetUrl } from '../api';
import { useCatalog } from '../catalogContext';
import { InfoChip, SectionHeading } from '../components/cards';
import { H5PageChrome, H5TabBar } from '../components/H5Chrome';
import { PageHero } from '../components/PageHero';
import { ProductVisual } from '../components/PrintingVisuals';
import { useI18n } from '../i18n';
import type { Product } from '../types';

export function ProductDetailPage() {
  const { id } = useParams();
  const { products } = useCatalog();
  const { t, text } = useI18n();
  const [product, setProduct] = useState<Product | null>(null);
  const [hasError, setHasError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      return;
    }
    setLoading(true);
    setHasError(false);
    fetchCatalogProduct(id)
      .then((data) => setProduct(data))
      .catch(() => {
        const fallback = products.find((item) => String(item.id) === id) ?? null;
        if (fallback) {
          setProduct(fallback);
        } else {
          setHasError(true);
        }
      })
      .finally(() => setLoading(false));
  }, [id, products]);

  if (loading) {
    return (
      <div className="lc-subpage">
        <H5PageChrome title={t('products.detail.title')} subtitle={t('products.detail.loadingSubtitle')} />
        <div className="lc-container">
          <div className="lc-empty-state lc-card">
            <h3>{t('products.detail.loadingTitle')}</h3>
            <p>{t('products.detail.loadingDesc')}</p>
          </div>
        </div>
        <H5TabBar />
      </div>
    );
  }

  if (hasError || !product) {
    return (
      <div className="lc-subpage">
        <H5PageChrome title={t('products.detail.title')} subtitle={t('products.detail.unavailableSubtitle')} />
        <div className="lc-container">
          <div className="lc-empty-state lc-card">
            <h3>{t('products.detail.notFound')}</h3>
            <p>{t('products.detail.backListDesc')}</p>
            <Link className="lc-button primary" to="/products">
              {t('products.detail.backList')}
            </Link>
          </div>
        </div>
        <H5TabBar />
      </div>
    );
  }

  const gallery = product.galleryJson ?? [];
  const templates = product.templates ?? [];

  return (
    <div className="lc-subpage">
      <H5PageChrome title={text(product.name)} subtitle={text(product.category?.name) || t('products.detail.categoryFallback')} />
      <PageHero
        kicker={text(product.category?.name) || 'Product Detail'}
        title={text(product.name)}
        desc={text(product.description ?? product.applicationScenario) || t('products.detail.descFallback')}
      >
        <Link className="lc-button primary" to={`/quote?productId=${product.id}`}>
          {t('products.detail.quoteCta')}
        </Link>
      </PageHero>

      <section className="lc-section">
        <div className="lc-container lc-detail-layout">
          <div className="lc-card lc-detail-media">
            {product.coverImage ? (
              <img src={toAssetUrl(product.coverImage)} alt={text(product.name)} loading="lazy" />
            ) : (
              <ProductVisual product={product} tone={1} />
            )}
          </div>
          <div className="lc-detail-copy">
            <SectionHeading
              kicker={t('products.detail.applicationEyebrow')}
              title={t('products.detail.applicationTitle')}
            />
            <p>{text(product.applicationScenario) || t('products.detail.applicationFallback')}</p>
            <div className="lc-chip-cloud">
              <InfoChip>{t('products.detail.chip.size')}</InfoChip>
              <InfoChip>{t('products.detail.chip.material')}</InfoChip>
              <InfoChip>{t('products.detail.chip.proofing')}</InfoChip>
              <InfoChip>{t('products.detail.chip.batch')}</InfoChip>
            </div>
            <div className="lc-detail-actions">
              <Link className="lc-button primary" to={`/quote?productId=${product.id}`}>
                {t('products.detail.onlineQuote')}
              </Link>
              <Link className="lc-button ghost" to="/products">
                {t('products.detail.backProducts')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {gallery.length > 0 ? (
        <section className="lc-section lc-section-soft">
          <div className="lc-container">
            <SectionHeading
              kicker={t('products.detail.galleryEyebrow')}
              title={t('products.detail.galleryTitle')}
              desc={`${gallery.length} ${t('products.detail.galleryCount')}`}
            />
            <div className="lc-gallery-grid">
              {gallery.map((src) => (
                <img key={src} src={toAssetUrl(src)} alt={text(product.name)} loading="lazy" />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="lc-section lc-section-soft">
        <div className="lc-container">
          <SectionHeading
            kicker={t('products.detail.templateEyebrow')}
            title={t('products.detail.templateTitle')}
            desc={t('products.detail.templateDesc')}
          />
          {templates.length === 0 ? (
            <div className="lc-empty-state lc-card">
              <h3>{t('products.detail.templateEmptyTitle')}</h3>
              <p>{t('products.detail.templateEmptyDesc')}</p>
            </div>
          ) : (
            <div className="lc-grid-3">
              {templates.map((template) => (
                <article className="lc-card lc-template-card" key={template.id}>
                  <h3>{text(template.templateName)}</h3>
                  <p>
                    {t('products.detail.templateWidth')} {String(template.widthMin)} - {String(template.widthMax)} mm /{' '}
                    {t('products.detail.templateHeight')} {String(template.heightMin)} - {String(template.heightMax)} mm
                  </p>
                  <strong>
                    {t('products.detail.templateQuantity')} {template.quantityMin} - {template.quantityMax}
                  </strong>
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
