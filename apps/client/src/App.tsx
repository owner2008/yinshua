import { useState } from 'react';
import { NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { CatalogProvider, useCatalog } from './catalogContext';
import {
  AboutPage,
  AdvantagesPage,
  ApplicationsPage,
  CasesPage,
  ContactPage,
  FactoryPage,
  JobsPage,
} from './pages/CorporatePages';
import { HomePage } from './pages/Home';
import { MemberCenterPage } from './pages/MemberCenter';
import { ProductDetailPage } from './pages/ProductDetail';
import { ProductListPage } from './pages/ProductList';

const homeNavItems = [
  ['首页导航', 'top'],
  ['主营产品', 'products'],
  ['行业应用', 'applications'],
  ['企业优势', 'advantages'],
  ['产品案例', 'cases'],
  ['生产实力', 'factory'],
  ['联系我们', 'contact'],
] as const;

export function App() {
  return (
    <CatalogProvider>
      <Shell />
    </CatalogProvider>
  );
}

function Shell() {
  const { session } = useCatalog();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  function goHomeSection(sectionId: string) {
    setMobileNavOpen(false);

    const scrollToSection = () => {
      if (sectionId === 'top') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    if (location.pathname !== '/') {
      navigate('/');
      window.setTimeout(scrollToSection, 80);
      return;
    }
    scrollToSection();
  }

  return (
    <main className="corporate-site">
      <header className="site-header" id="top">
        <div className="site-header-inner">
          <NavLink to="/" className="site-brand" aria-label="东方丽彩印刷首页">
            <img src="/images/logo.png" alt="东方丽彩印刷" />
            <span>
              <strong>东方丽彩印刷</strong>
              <small>专业印刷 品质如一 用心服务</small>
            </span>
          </NavLink>
          <nav className="site-nav" aria-label="主导航">
            <NavLink to="/" end>
              首页
            </NavLink>
            <NavLink to="/about">关于我们</NavLink>
            <NavLink to="/products">产品中心</NavLink>
            <NavLink to="/applications">行业应用</NavLink>
            <NavLink to="/advantages">企业优势</NavLink>
            <NavLink to="/cases">产品案例</NavLink>
            <NavLink to="/factory">生产实力</NavLink>
            <NavLink to="/jobs">人才招聘</NavLink>
            <NavLink to="/contact">联系我们</NavLink>
            {session ? <NavLink to="/member">会员中心</NavLink> : null}
          </nav>
          <button
            className="mobile-menu-button"
            type="button"
            aria-label={mobileNavOpen ? '关闭导航菜单' : '展开导航菜单'}
            aria-expanded={mobileNavOpen}
            onClick={() => setMobileNavOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <div
        className={`mobile-nav-scrim${mobileNavOpen ? ' is-open' : ''}`}
        aria-hidden="true"
        onClick={() => setMobileNavOpen(false)}
      />
      <nav className={`mobile-home-nav${mobileNavOpen ? ' is-open' : ''}`} aria-label="首页导航菜单">
        {homeNavItems.map(([label, sectionId]) => (
          <button key={sectionId} type="button" onClick={() => goHomeSection(sectionId)}>
            {label}
          </button>
        ))}
      </nav>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/applications" element={<ApplicationsPage />} />
        <Route path="/advantages" element={<AdvantagesPage />} />
        <Route path="/cases" element={<CasesPage />} />
        <Route path="/factory" element={<FactoryPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/member" element={<MemberCenterPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </main>
  );
}
