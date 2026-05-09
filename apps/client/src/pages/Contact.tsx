import { Link } from 'react-router-dom';
import { brand, companyProfile, officialEquipmentShowcase, officialProductShowcase, qrCodeImage } from '../brandContent';
import { InfoChip, SectionHeading } from '../components/cards';
import { H5PageChrome, H5TabBar } from '../components/H5Chrome';
import { PageHero } from '../components/PageHero';
import { useI18n } from '../i18n';

export function ContactPage() {
  const { t, text } = useI18n();

  return (
    <div className="lc-subpage">
      <H5PageChrome title={t('contact.hero.title')} subtitle={t('contact.hero.subtitle')} />
      <PageHero kicker={t('contact.hero.eyebrow')} title={t('contact.hero.title')} desc={t('contact.hero.desc')}>
        <Link className="lc-button primary" to="/quote">
          {t('contact.hero.cta')}
        </Link>
      </PageHero>

      <section className="lc-section">
        <div className="lc-container lc-contact-layout">
          <article className="lc-card lc-contact-intro">
            <p className="lc-kicker">{t('contact.profile.kicker')}</p>
            <h2>{text(brand.companyName)}</h2>
            <p>{text(companyProfile.desc)}</p>
            <div className="lc-chip-cloud">
              {companyProfile.services.map((item) => (
                <InfoChip key={item}>{text(item)}</InfoChip>
              ))}
            </div>
          </article>

          <aside className="lc-card lc-contact-card">
            <p className="lc-kicker">{t('contact.card.kicker')}</p>
            <h2>{t('contact.card.title')}</h2>
            <dl>
              <div>
                <dt>{t('contact.phone')}</dt>
                <dd>{brand.phone}</dd>
              </div>
              <div>
                <dt>{t('contact.mobile')}</dt>
                <dd>{brand.mobile}</dd>
              </div>
              <div>
                <dt>{t('contact.person')}</dt>
                <dd>{text(brand.contactPerson)}</dd>
              </div>
              <div>
                <dt>{t('contact.address')}</dt>
                <dd>{text(brand.address)}</dd>
              </div>
            </dl>
            <img src={qrCodeImage} alt={t('contact.qrAlt')} loading="lazy" referrerPolicy="no-referrer" />
          </aside>
        </div>
      </section>

      <section className="lc-section lc-section-soft">
        <div className="lc-container">
          <SectionHeading kicker={t('contact.products.eyebrow')} title={t('contact.products.title')} desc={t('contact.products.desc')} />
          <div className="lc-official-gallery">
            {officialProductShowcase.map((item) => (
              <article className="lc-card" key={item.title}>
                <img src={item.imageUrl} alt={text(item.title)} loading="lazy" referrerPolicy="no-referrer" />
                <strong>{text(item.title)}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="lc-section">
        <div className="lc-container">
          <SectionHeading kicker={t('contact.equipment.eyebrow')} title={t('contact.equipment.title')} desc={t('contact.equipment.desc')} />
          <div className="lc-official-gallery equipment">
            {officialEquipmentShowcase.map((item) => (
              <article className="lc-card" key={`${item.title}-${item.imageUrl}`}>
                <img src={item.imageUrl} alt={text(item.title)} loading="lazy" referrerPolicy="no-referrer" />
                <strong>{text(item.title)}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>
      <H5TabBar />
    </div>
  );
}
