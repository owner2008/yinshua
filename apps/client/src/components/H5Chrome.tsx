import { Link, NavLink } from 'react-router-dom';
import { useI18n } from '../i18n';
import { LanguageSwitch } from './LanguageSwitch';

export function H5PageChrome({ title, subtitle }: { title: string; subtitle?: string }) {
  const { t, text } = useI18n();

  return (
    <div className="lc-h5-page-chrome" aria-label={text(title)}>
      <div className="lc-h5-page-bar">
        <Link to="/" className="lc-h5-page-brand" aria-label={t('brand.homeAria')}>
          <span>LC</span>
          <strong>{t('brand.h5Name')}</strong>
        </Link>
        <div className="lc-h5-page-actions">
          <LanguageSwitch compact />
          <button className="lc-h5-page-menu" type="button" aria-label={t('h5.menuAria')}>
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
      <section className="lc-h5-page-title">
        <p>Qingdao Label Printing</p>
        <h1>{text(title)}</h1>
        {subtitle ? <span>{text(subtitle)}</span> : null}
      </section>
    </div>
  );
}

export function H5TabBar() {
  const { t } = useI18n();

  return (
    <nav className="lc-h5-tabbar" aria-label={t('h5.tab.aria')}>
      <NavLink to="/" end>
        {t('h5.tab.home')}
      </NavLink>
      <NavLink to="/products">{t('h5.tab.products')}</NavLink>
      <NavLink to="/quote">{t('h5.tab.quote')}</NavLink>
      <NavLink to="/history">{t('h5.tab.history')}</NavLink>
      <NavLink to="/member">{t('h5.tab.member')}</NavLink>
    </nav>
  );
}
