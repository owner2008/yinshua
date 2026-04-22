import { createHmac, timingSafeEqual } from 'node:crypto';

export interface AdminTokenPayload {
  sub: string;
  role: string;
  permissions: string[];
  exp: number;
}

export const defaultAdminPermissions = [
  'admin:product',
  'admin:pricing',
  'admin:quote-rule',
  'admin:quote',
  'admin:inventory',
  'admin:audit-log',
  'admin:permission',
];

export function createAdminToken(
  username: string,
  permissions: string[] = defaultAdminPermissions,
): { token: string; expiresAt: string; permissions: string[] } {
  const expiresInSeconds = Number(process.env.ADMIN_TOKEN_TTL_SECONDS ?? 60 * 60 * 8);
  const payload: AdminTokenPayload = {
    sub: username,
    role: 'admin',
    permissions,
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
  };
  const encodedPayload = encode(payload);
  const signature = sign(encodedPayload);
  return {
    token: `${encodedPayload}.${signature}`,
    expiresAt: new Date(payload.exp * 1000).toISOString(),
    permissions: payload.permissions,
  };
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) {
    return null;
  }

  const expected = sign(encodedPayload);
  if (!safeEqual(signature, expected)) {
    return null;
  }

  const payload = decode(encodedPayload);
  if (!payload || payload.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
}

function encode(payload: AdminTokenPayload): string {
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
}

function decode(value: string): AdminTokenPayload | null {
  try {
    return JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as AdminTokenPayload;
  } catch {
    return null;
  }
}

function sign(value: string): string {
  return createHmac('sha256', getSecret()).update(value).digest('base64url');
}

function getSecret(): string {
  return process.env.ADMIN_AUTH_SECRET ?? 'dev-admin-auth-secret';
}

function safeEqual(actual: string, expected: string): boolean {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}
