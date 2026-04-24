import type {
  CatalogHome,
  MemberAddress,
  MemberProfile,
  MemberQuote,
  MemberSession,
  Product,
  ProductCategory,
  ProductTemplate,
  QuoteInput,
  QuoteResult,
} from './types';

export const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';
const MEMBER_SESSION_KEY = 'yinshua_member_session';

export async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const session = getMemberSession();
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(parseError(text) || `HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function post<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function put<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function loginMember(code = 'mock_dev', nickname = '开发用户') {
  return post<MemberSession>('/auth/wx-login', { code, nickname });
}

export function getMemberSession(): MemberSession | null {
  try {
    const raw = localStorage.getItem(MEMBER_SESSION_KEY);
    if (!raw) {
      return null;
    }

    const session = JSON.parse(raw) as MemberSession;
    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      clearMemberSession();
      return null;
    }

    return session;
  } catch {
    clearMemberSession();
    return null;
  }
}

export function saveMemberSession(session: MemberSession) {
  localStorage.setItem(MEMBER_SESSION_KEY, JSON.stringify(session));
}

export function clearMemberSession() {
  localStorage.removeItem(MEMBER_SESSION_KEY);
}

export function fetchCatalogHome() {
  return request<CatalogHome>('/catalog/home');
}

export function fetchCatalogCategories() {
  return request<ProductCategory[]>('/catalog/categories');
}

export function fetchCatalogProducts(categoryId?: string | number) {
  const query = categoryId ? `?categoryId=${categoryId}` : '';
  return request<Product[]>(`/catalog/products${query}`);
}

export function fetchCatalogProduct(id: string | number) {
  return request<Product>(`/catalog/products/${id}`);
}

export function fetchTemplatesByProduct(productId: string | number) {
  return request<ProductTemplate[]>(`/admin/product-templates`).then((list) =>
    list.filter((template) => Number(template.productId) === Number(productId)),
  );
}

export function calculateQuote(input: QuoteInput) {
  return post<QuoteResult>('/quotes/calculate', input);
}

export function saveQuote(input: QuoteInput) {
  return post<QuoteResult>('/quotes', input);
}

export function fetchMyQuotes() {
  return request<MemberQuote[]>('/member/quotes');
}

export function fetchMyProfile() {
  return request<MemberProfile | null>('/member/profile');
}

export function registerMyProfile(dto: MemberProfile) {
  return post<MemberProfile>('/member/register', dto);
}

export function upsertMyProfile(dto: MemberProfile) {
  return put<MemberProfile>('/member/profile', dto);
}

export function fetchMyAddresses() {
  return request<MemberAddress[]>('/member/addresses');
}

export function createMyAddress(dto: Omit<MemberAddress, 'id'>) {
  return post<MemberAddress>('/member/addresses', dto);
}

export function updateMyAddress(id: string | number, dto: Partial<Omit<MemberAddress, 'id'>>) {
  return put<MemberAddress>(`/member/addresses/${id}`, dto);
}

export function setDefaultMyAddress(id: string | number) {
  return put<MemberAddress>(`/member/addresses/${id}/default`, {});
}

export function deleteMyAddress(id: string | number) {
  return request<{ success: boolean }>(`/member/addresses/${id}`, { method: 'DELETE' });
}

function parseError(text: string): string {
  if (!text) {
    return '';
  }

  try {
    const data = JSON.parse(text) as { message?: string | string[]; error?: string };
    if (Array.isArray(data.message)) {
      return data.message.join('；');
    }
    return data.message ?? data.error ?? text;
  } catch {
    return text;
  }
}
