import { Route, Routes } from 'react-router-dom';
import { CatalogProvider } from './catalogContext';
import { BrandFooter, BrandHeader } from './components/BrandShell';
import { ContactPage } from './pages/Contact';
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
  return (
    <main className="app-shell">
      <BrandHeader />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/quote" element={<QuotePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/member" element={<MemberCenterPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
      <BrandFooter />
    </main>
  );
}
