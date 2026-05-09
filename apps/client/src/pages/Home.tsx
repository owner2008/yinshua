import { Link } from 'react-router-dom';
import {
  advantages,
  brand,
  cases,
  cooperationSteps,
  crafts,
  factoryVisual,
  heroCopy,
  industries,
  materials,
  productCategories,
  qualityItems,
  quoteSteps,
  testimonials,
  trustLogos,
} from '../brandContent';
import { FeatureCard, InfoChip, ProcessStep, SectionHeading, StatCard } from '../components/cards';
import { LanguageSwitch } from '../components/LanguageSwitch';
import { HeroPrintingVisual, MaterialSample, ProductPhoto, QrVisual } from '../components/PrintingVisuals';
import { useI18n } from '../i18n';

export function HomePage() {
  const { t, text } = useI18n();
  const displayProducts = productCategories.slice(0, 10);

  return (
    <>
      <div className="lc-home lc-home-desktop">
        <section className="lc-hero lc-container">
          <div className="lc-hero-copy">
            <p className="lc-kicker">{text(heroCopy.kicker)}</p>
            <h1>{text(heroCopy.title)}</h1>
            <p>{text(heroCopy.subtitle)}</p>
            <div className="lc-hero-actions">
              <Link className="lc-button primary" to="/quote">
                {t('home.hero.primaryCta')}
              </Link>
              <a className="lc-button ghost" href="#cases">
                {t('home.hero.secondaryCta')}
              </a>
            </div>
            <div className="lc-hero-stats">
              <StatCard label={t('home.hero.stat.products')} value="10+" />
              <StatCard label={t('home.hero.stat.crafts')} value="9" />
              <StatCard label={t('home.hero.stat.industries')} value="8+" />
            </div>
          </div>
          <HeroPrintingVisual />
        </section>

        <section className="lc-section">
          <div className="lc-container">
            <SectionHeading
              kicker={t('home.advantages.eyebrow')}
              title={t('home.advantages.title')}
              desc={t('home.advantages.desc')}
            />
            <div className="lc-grid-3">
              {advantages.map((item) => (
                <FeatureCard
                  key={item.title}
                  mark={text(item.mark)}
                  title={text(item.title)}
                  desc={text(item.desc)}
                  color={item.color}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="lc-section lc-section-soft">
          <div className="lc-container">
            <SectionHeading
              kicker={t('home.products.eyebrow')}
              title={t('home.products.title')}
              desc={t('home.products.desc')}
              action={<Link to="/products">{t('home.products.viewAll')}</Link>}
            />
            <div className="lc-grid-4">
              {displayProducts.map((item) => (
                <article className="lc-product-card lc-card" key={item.name}>
                  <ProductPhoto src={item.imageUrl} alt={text(item.name)} />
                  <h3>{text(item.name)}</h3>
                  <p>{text(item.desc)}</p>
                  <Link to="/products">{t('common.viewDetails')}</Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="lc-section" id="quote">
          <div className="lc-container lc-quote-layout">
            <div className="lc-quote-copy">
              <SectionHeading
                kicker={t('home.quote.eyebrow')}
                title={t('home.quote.title')}
                desc={t('home.quote.desc')}
              />
              <div className="lc-quote-steps">
                {quoteSteps.map((step, index) => (
                  <ProcessStep key={step} index={index + 1} title={text(step)} />
                ))}
              </div>
            </div>
            <form className="lc-quote-form">
              <label>
                {t('home.quote.field.productType')}
                <select defaultValue={productCategories[0]?.name}>
                  {productCategories.slice(0, 8).map((item) => (
                    <option key={item.name} value={item.name}>
                      {text(item.name)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {t('home.quote.field.size')}
                <input placeholder={t('home.quote.placeholder.size')} />
              </label>
              <label>
                {t('home.quote.field.material')}
                <select defaultValue={materials[0]}>
                  {materials.slice(0, 6).map((item) => (
                    <option key={item} value={item}>
                      {text(item)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {t('home.quote.field.quantity')}
                <input placeholder={t('home.quote.placeholder.quantity')} />
              </label>
              <label className="lc-form-wide">
                {t('home.quote.field.craft')}
                <input placeholder={t('home.quote.placeholder.craft')} />
              </label>
              <label className="lc-form-wide">
                {t('home.quote.field.contact')}
                <input placeholder={t('home.quote.placeholder.contact')} />
              </label>
              <Link className="lc-button primary lc-form-submit" to="/quote">
                {t('home.quote.submit')}
              </Link>
            </form>
          </div>
        </section>

        <section className="lc-section lc-section-soft">
          <div className="lc-container">
            <SectionHeading kicker={t('home.industries.eyebrow')} title={t('home.industries.title')} />
            <div className="lc-industry-grid">
              {industries.map((item, index) => (
                <article className="lc-industry-card" key={item}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{text(item)}</strong>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="lc-section" id="craft">
          <div className="lc-container">
            <SectionHeading kicker={t('home.materials.eyebrow')} title={t('home.materials.title')} />
            <div className="lc-craft-layout">
              <div className="lc-card lc-sample-panel">
                <h3>{t('home.materials.commonMaterials')}</h3>
                <div className="lc-sample-grid">
                  {materials.map((item, index) => (
                    <MaterialSample key={item} label={text(item)} tone={index % 4} />
                  ))}
                </div>
              </div>
              <div className="lc-card lc-sample-panel">
                <h3>{t('home.materials.commonCrafts')}</h3>
                <div className="lc-chip-cloud">
                  {crafts.map((item) => (
                    <InfoChip key={item}>{text(item)}</InfoChip>
                  ))}
                </div>
                <QrVisual />
              </div>
            </div>
          </div>
        </section>

        <section className="lc-section lc-section-soft" id="cases">
          <div className="lc-container">
            <SectionHeading kicker={t('home.cases.eyebrow')} title={t('home.cases.title')} desc={t('home.cases.desc')} />
            <div className="lc-grid-3">
              {cases.map((item) => (
                <article className="lc-case-card lc-card" key={item.title}>
                  <ProductPhoto src={item.imageUrl} alt={text(item.title)} />
                  <div className="lc-case-body">
                    <span>{text(item.industry)}</span>
                    <h3>{text(item.title)}</h3>
                    <p>{text(item.material)}</p>
                    <strong>{text(item.highlight)}</strong>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="lc-section" id="quality">
          <div className="lc-container">
            <SectionHeading
              kicker={t('home.quality.eyebrow')}
              title={t('home.quality.title')}
              desc={t('home.quality.desc')}
            />
            <div className="lc-quality-showcase">
              <figure className="lc-factory-photo">
                <img
                  src={factoryVisual.imageUrl}
                  alt={text(factoryVisual.title)}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <figcaption>
                  <span>{t('home.quality.factoryView')}</span>
                  <strong>{text(factoryVisual.title)}</strong>
                </figcaption>
              </figure>
              <div className="lc-quality-stack">
                <div className="lc-quality-stats">
                  {factoryVisual.stats.map((item) => (
                    <article key={item.label}>
                      <strong>{item.value}</strong>
                      <span>{text(item.label)}</span>
                    </article>
                  ))}
                </div>
                <div className="lc-quality-grid">
                  {qualityItems.map((item, index) => (
                    <article className="lc-quality-item" key={item}>
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      <strong>{text(item)}</strong>
                    </article>
                  ))}
                </div>
              </div>
            </div>
            <div className="lc-process-timeline">
              {cooperationSteps.map((item, index) => (
                <ProcessStep key={item} index={index + 1} title={text(item)} />
              ))}
            </div>
          </div>
        </section>

        <section className="lc-section lc-section-soft">
          <div className="lc-container lc-trust-section">
            <SectionHeading kicker={t('home.trust.eyebrow')} title={t('home.trust.title')} desc={t('home.trust.desc')} />
            <div className="lc-testimonials">
              {testimonials.map((item, index) => (
                <article className="lc-card" key={item}>
                  <span>
                    {t('home.trust.testimonial')} {index + 1}
                  </span>
                  <p>{text(item)}</p>
                </article>
              ))}
            </div>
            <div className="lc-logo-wall" aria-label={t('home.trust.logoAria')}>
              {trustLogos.map((item) => (
                <span key={item}>{text(item)}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="lc-final-cta lc-container">
          <h2>{t('home.finalCta.title')}</h2>
          <p>{t('home.finalCta.subtitle')}</p>
          <div>
            <Link className="lc-button primary" to="/quote">
              {t('home.hero.primaryCta')}
            </Link>
            <a className="lc-button ghost" href="#contact">
              {t('common.contact')}
            </a>
          </div>
        </section>
      </div>
      <MobileHomePage />
    </>
  );
}

function MobileHomePage() {
  const { t, text } = useI18n();
  const h5Products = productCategories.slice(0, 7);

  return (
    <div className="lc-h5-home" aria-label={t('home.h5.aria')}>
      <header className="lc-h5-header">
        <Link to="/" className="lc-h5-brand" aria-label={t('brand.homeAria')}>
          <span className="lc-h5-logo-mark">LC</span>
          <strong>{t('brand.h5Name')}</strong>
        </Link>
        <div className="lc-h5-page-actions">
          <LanguageSwitch compact />
          <button className="lc-h5-menu" type="button" aria-label={t('h5.menuAria')}>
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <section className="lc-h5-hero">
        <div className="lc-h5-hero-copy">
          <h1>
            {t('home.h5.heroTitle.before')} <span>{t('home.h5.heroTitle.after')}</span>
          </h1>
          <p>{t('home.h5.heroLine1')}</p>
          <p>{t('home.h5.heroLine2')}</p>
        </div>
        <div className="lc-h5-hero-media">
          <img src="/official/qddflc/equipment-uv-line.jpg" alt={t('home.h5.heroImageAlt')} />
        </div>
        <div className="lc-h5-dots" aria-hidden="true">
          <span className="active" />
          <span />
          <span />
        </div>
      </section>

      <section className="lc-h5-section lc-h5-products">
        <div className="lc-h5-section-title">
          <h2>{t('home.h5.productsTitle')}</h2>
          <p>{t('home.h5.productsDesc')}</p>
        </div>
        <div className="lc-h5-product-grid">
          {h5Products.map((item) => (
            <Link className="lc-h5-product-card" to="/products" key={item.name}>
              <img src={item.imageUrl} alt={text(item.name)} />
              <strong>{text(item.name)}</strong>
            </Link>
          ))}
        </div>
      </section>

      <section className="lc-h5-advantages">
        <h2>
          {t('home.h5.advantagesTitle.before')} <span>4</span> {t('home.h5.advantagesTitle.after')}
        </h2>
        <div>
          {advantages.slice(0, 4).map((item) => (
            <article key={item.title}>
              <span>{text(item.mark)}</span>
              <strong>{text(item.title)}</strong>
              <p>{text(item.desc)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="lc-h5-section lc-h5-cases">
        <div className="lc-h5-section-title">
          <h2>{t('home.h5.casesTitle')}</h2>
          <p>{t('home.h5.casesDesc')}</p>
        </div>
        <div className="lc-h5-case-list">
          {cases.slice(0, 4).map((item) => (
            <article key={item.title}>
              <img src={item.imageUrl} alt={text(item.title)} />
              <strong>{text(item.title)}</strong>
            </article>
          ))}
        </div>
        <Link className="lc-h5-more" to="/products">
          {t('home.h5.moreCases')}
        </Link>
      </section>

      <section className="lc-h5-quote-band">
        <div>
          <strong>{t('home.h5.quickQuote')}</strong>
          <span>{t('home.h5.quickQuoteDesc')}</span>
        </div>
        <Link to="/quote">{t('nav.quote')}</Link>
      </section>

      <nav className="lc-h5-bottom-cta" aria-label={t('home.h5.actionsAria')}>
        <a href={`tel:${brand.mobile}`}>{t('home.h5.consult')}</a>
        <Link className="primary" to="/quote">
          {t('nav.quote')}
        </Link>
        <a href={`tel:${brand.mobile}`}>{t('home.h5.call')}</a>
      </nav>
    </div>
  );
}
