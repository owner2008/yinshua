export const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';
export const ADMIN_SESSION_KEY = 'yinshua_admin_session';

export interface AdminSession {
  token: string;
  expiresAt: string;
  user: {
    username: string;
    role: string;
    permissions: string[];
  };
}

export async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearAdminSession();
      window.dispatchEvent(new Event('admin-session-expired'));
    }
    const text = await response.text();
    throw new Error(text || `HTTP ${response.status}`);
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

export function loginAdmin(body: { username: string; password: string }): Promise<AdminSession> {
  return post<AdminSession>('/auth/admin-login', body);
}

export function getAdminSession(): AdminSession | null {
  const raw = localStorage.getItem(ADMIN_SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    const session = JSON.parse(raw) as AdminSession;
    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      clearAdminSession();
      return null;
    }
    return session;
  } catch {
    clearAdminSession();
    return null;
  }
}

export function saveAdminSession(session: AdminSession) {
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
}

export function clearAdminSession() {
  localStorage.removeItem(ADMIN_SESSION_KEY);
}

export function hasAdminPermission(permission: string): boolean {
  return getAdminSession()?.user.permissions.includes(permission) ?? false;
}

function authHeader(): Record<string, string> {
  const session = getAdminSession();
  return session ? { Authorization: `Bearer ${session.token}` } : {};
}
