import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import {
  fetchCatalogCategories,
  fetchCatalogHome,
  fetchCatalogProducts,
  getMemberSession,
} from './api';
import { sampleCategories, sampleProducts } from './sampleData';
import type { CatalogHome, MemberSession, Product, ProductCategory } from './types';

interface CatalogContextValue {
  categories: ProductCategory[];
  products: Product[];
  home: CatalogHome | null;
  loading: boolean;
  usingFallback: boolean;
  session: MemberSession | null;
  notice: string;
  setNotice: (value: string) => void;
  refresh: () => Promise<void>;
  ensureSession: () => Promise<MemberSession>;
  resetSession: (next: MemberSession | null) => void;
}

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<ProductCategory[]>(sampleCategories);
  const [products, setProducts] = useState<Product[]>(sampleProducts);
  const [home, setHome] = useState<CatalogHome | null>(null);
  const [loading, setLoading] = useState(false);
  const [usingFallback, setUsingFallback] = useState(true);
  const [session, setSession] = useState<MemberSession | null>(() => getMemberSession());
  const [notice, setNotice] = useState('正在读取产品配置');

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [homeData, categoryList, productList] = await Promise.all([
        fetchCatalogHome().catch(() => null),
        fetchCatalogCategories().catch(() => [] as ProductCategory[]),
        fetchCatalogProducts().catch(() => [] as Product[]),
      ]);
      const hasRemote = (productList && productList.length > 0) || (categoryList && categoryList.length > 0);

      if (hasRemote) {
        setCategories(categoryList.length > 0 ? categoryList : sampleCategories);
        setProducts(productList.length > 0 ? productList : sampleProducts);
        setHome(homeData);
        setUsingFallback(false);
        setNotice('产品配置已同步');
      } else {
        setCategories(sampleCategories);
        setProducts(sampleProducts);
        setHome(null);
        setUsingFallback(true);
        setNotice('正在使用内置样例配置');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const ensureSession = useCallback(async () => {
    const existing = getMemberSession();
    if (existing) {
      setSession(existing);
      return existing;
    }
    throw new Error('会员登录暂未开放');
  }, []);

  const resetSession = useCallback((next: MemberSession | null) => {
    setSession(next);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <CatalogContext.Provider
      value={{
        categories,
        products,
        home,
        loading,
        usingFallback,
        session,
        notice,
        setNotice,
        refresh,
        ensureSession,
        resetSession,
      }}
    >
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  const value = useContext(CatalogContext);
  if (!value) {
    throw new Error('CatalogProvider missing');
  }
  return value;
}
