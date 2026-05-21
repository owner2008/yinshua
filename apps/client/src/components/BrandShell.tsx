import { NavLink } from 'react-router-dom';
import { brand, navItems, productCategories } from '../brandContent';
import { useI18n } from '../i18n';
import { LanguageSwitch } from './LanguageSwitch';

const navKeyByHref = {
  '/': 'nav.home',
  '/products': 'nav.products',
  '/#cases': 'nav.cases',
  '/contact': 'nav.contact',
} as const;

export function BrandHeader() {
  const { t, text } = useI18n();

  return (
    <header className="lc-header">
      <NavLink to="/" className="lc-logo" aria-label={t('brand.homeAria')}>
        <span>LC</span>
        <div>
          <strong>{t('brand.shortName')}</strong>
          <small>{text(brand.subtitle)}</small>
        </div>
      </NavLink>
      <nav className="lc-nav" aria-label={t('nav.aria')}>
        {navItems.map((item) => (
          <NavLink key={item.label} to={item.href} end={item.href === '/'}>
            {t(navKeyByHref[item.href])}
          </NavLink>
        ))}
      </nav>
      <div className="lc-header-actions" aria-label={t('nav.actionsAria')}>
        <LanguageSwitch />
        <NavLink className="lc-header-link" to="/member">
          {t('nav.member')}
        </NavLink>
        <NavLink className="lc-button primary lc-header-cta" to="/products">
          {t('nav.products')}
        </NavLink>
      </div>
    </header>
  );
}

export function BrandFooter() {
  const { t, text } = useI18n();

  return (
    <footer id="contact" className="lc-footer">
      <div className="lc-footer-brand">
        <h2>{text(brand.companyName)}</h2>
        <p>{t('footer.business')}</p>
      </div>
      <div className="lc-footer-links">
        <h3>{t('footer.products')}</h3>
        <div>
          {productCategories.slice(0, 8).map((item) => (
            <NavLink key={item.name} to="/products">
              {text(item.name)}
            </NavLink>
          ))}
        </div>
      </div>
      <div className="lc-footer-contact">
        <span>
          {t('footer.phone')}: {brand.phone}
        </span>
        <span>
          {t('footer.mobile')}: {brand.mobile}
        </span>
        <span>
          {t('footer.contactPerson')}: {text(brand.contactPerson)}
        </span>
        <span>
          {t('footer.address')}: {text(brand.address)}
        </span>
        <span>
          {t('footer.icp')}: {brand.recordNo}
        </span>
      </div>
      <div className="lc-footer-qr" aria-label={t('footer.qrAria')}>
        {t('footer.qr')}
      </div>
    </footer>
  );
}
