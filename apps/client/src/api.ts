import type {
  CatalogHome,
  MemberAddress,
  MemberProfile,
  MemberSession,
  Product,
  ProductCategory,
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
    if (response.status === 401) clearMemberSession();
    throw new ApiRequestError(response.status, parseError(text) || `HTTP ${response.status}`);
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

export class ApiRequestError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
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

export function toAssetUrl(path?: string | null) {
  if (!path) {
    return '';
  }
  const officialAsset = mapOfficialRemoteAsset(path);
  if (officialAsset) {
    return officialAsset;
  }
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  return path.startsWith('/') ? path : `/${path}`;
}

const OFFICIAL_REMOTE_ASSETS: Record<string, string> = {
  '/uploads/image/20140606/1402073029.jpg': '/official/qddflc/label-self-adhesive.jpg',
  '/uploads/image/20140611/1402504974.jpg': '/official/qddflc/label-roll.jpg',
  '/uploads/image/20140611/1402500548.jpg': '/official/qddflc/product-insert.jpg',
  '/uploads/image/20140611/1402496559.jpg': '/official/qddflc/packaging-bag-box.jpg',
  '/uploads/image/20140611/1402503868.jpg': '/official/qddflc/brochure-print.jpg',
  '/uploads/image/20190810/1565408204.jpg': '/official/qddflc/equipment-uv-line.jpg',
  '/uploads/image/20190810/1565411248.jpg': '/official/qddflc/equipment-heidelberg.jpg',
  '/uploads/image/20140613/1402669288.jpg': '/official/qddflc/equipment-label-machine.jpg',
  '/uploads/image/20140613/1402673876.jpg': '/official/qddflc/equipment-roll-machine.jpg',
  '/uploads/image/20140613/1402671819.jpg': '/official/qddflc/equipment-print-machine.jpg',
  '/uploads/image/20140611/1402505008.jpg': '/official/qddflc/equipment-diecut.jpg',
  '/data/watermark/erweima.jpg': '/official/qddflc/wechat-qr.jpg',
};

function mapOfficialRemoteAsset(path: string) {
  try {
    const url = new URL(path);
    if (url.hostname === 'www.qddflc.com' || url.hostname === 'qddflc.com') {
      return OFFICIAL_REMOTE_ASSETS[url.pathname] ?? '';
    }
  } catch {
    return OFFICIAL_REMOTE_ASSETS[path.startsWith('/') ? path : `/${path}`] ?? '';
  }

  return '';
}

function parseError(text: string): string {
  if (!text) {
    return '';
  }

  try {
    const data = JSON.parse(text) as { message?: string | string[]; error?: string };
    if (Array.isArray(data.message)) {
      return data.message.join('，');
    }
    return data.message ?? data.error ?? text;
  } catch {
    return text;
  }
}
