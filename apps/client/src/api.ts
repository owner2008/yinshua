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

export function loginMember(code = 'mock_dev', nickname = '开发用户') {
  return post<import('./types').MemberSession>('/auth/wx-login', { code, nickname });
}

export function getMemberSession(): import('./types').MemberSession | null {
  try {
    const raw = localStorage.getItem(MEMBER_SESSION_KEY);
    if (!raw) {
      return null;
    }

    const session = JSON.parse(raw) as import('./types').MemberSession;
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

export function saveMemberSession(session: import('./types').MemberSession) {
  localStorage.setItem(MEMBER_SESSION_KEY, JSON.stringify(session));
}

export function clearMemberSession() {
  localStorage.removeItem(MEMBER_SESSION_KEY);
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
