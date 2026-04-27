import { NavLink, Route, Routes } from 'react-router-dom';
import { CatalogProvider, useCatalog } from './catalogContext';
import { toAssetUrl } from './api';
import { HistoryPage } from './pages/History';
import { HomePage } from './pages/Home';
import { MemberCenterPage } from './pages/MemberCenter';
import { ProductDetailPage } from './pages/ProductDetail';
import { ProductListPage } from './pages/ProductList';
import { QuotePage } from './pages/Quote';

type ThemeMode = 'graphite' | 'ivory' | 'forest';

export function App() {
  return (
    <CatalogProvider>
      <Shell />
    </CatalogProvider>
  );
}

function Shell() {
  const { notice, session, home } = useCatalog();
  const branding = home?.branding;
  const theme = normalizeThemeMode(branding?.themeMode);

  return (
    <main className="app-shell" data-theme={theme}>
      <header className="topbar panel">
        <div className="topbar-main">
          <div className="brand-block">
            {branding?.logoImage ? (
              <img className="brand-logo" src={toAssetUrl(branding.logoImage)} alt={branding.siteName} />
            ) : (
              <div className="brand-logo brand-logo-fallback" aria-hidden="true">
                印
              </div>
            )}
            <div className="brand-copy">
              <p className="eyebrow">{branding?.siteSubtitle ?? '高质感印刷展示与在线报价'}</p>
              <h1>{branding?.siteName ?? '印刷产品展示与在线报价'}</h1>
            </div>
          </div>
          <div className="topbar-actions">
            <span className="status-dot">
              {branding?.headerNotice || notice || '支持前台展示、产品浏览与在线报价'}
              {session?.user?.nickname ? ` · ${session.user.nickname}` : ''}
            </span>
          </div>
        </div>
        <nav className="tabs" aria-label="主导航">
          <NavLink to="/" end>
            首页
          </NavLink>
          <NavLink to="/products">产品中心</NavLink>
          <NavLink to="/quote">在线报价</NavLink>
          <NavLink to="/history">报价历史</NavLink>
          <NavLink to="/member">会员中心</NavLink>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/quote" element={<QuotePage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/member" element={<MemberCenterPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </main>
  );
}

function normalizeThemeMode(value?: string | null): ThemeMode {
  if (value === 'ivory' || value === 'forest') {
    return value;
  }
  return 'graphite';
}
