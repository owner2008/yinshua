import { NavLink, Route, Routes } from 'react-router-dom';
import { CatalogProvider, useCatalog } from './catalogContext';
import { toAssetUrl } from './api';
import { HistoryPage } from './pages/History';
import { HomePage } from './pages/Home';
import { MemberCenterPage } from './pages/MemberCenter';
import { ProductDetailPage } from './pages/ProductDetail';
import { ProductListPage } from './pages/ProductList';
import { QuotePage } from './pages/Quote';

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

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          {branding?.logoImage ? (
            <img className="brand-logo" src={toAssetUrl(branding.logoImage)} alt={branding.siteName} />
          ) : null}
          <div>
            <p className="eyebrow">{branding?.siteSubtitle ?? '不干胶印刷解决方案'}</p>
            <h1>{branding?.siteName ?? '产品展示与在线报价'}</h1>
          </div>
        </div>
        <span className="status-dot">
          {branding?.headerNotice || notice}
          {session?.user?.nickname ? ` · ${session.user.nickname}` : ''}
        </span>
      </header>
      <nav className="tabs" aria-label="主导航">
        <NavLink to="/" end>
          首页
        </NavLink>
        <NavLink to="/products">产品</NavLink>
        <NavLink to="/quote">在线报价</NavLink>
        <NavLink to="/history">历史报价</NavLink>
        <NavLink to="/member">会员中心</NavLink>
      </nav>
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
