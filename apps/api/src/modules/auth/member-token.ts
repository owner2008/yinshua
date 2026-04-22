import { createHmac, timingSafeEqual } from 'node:crypto';

export interface MemberTokenPayload {
  sub: string;
  wxOpenid?: string;
  exp: number;
}

export function createMemberToken(user: {
  id: bigint | number | string;
  wxOpenid?: string | null;
}): { token: string; expiresAt: string } {
  const expiresInSeconds = Number(process.env.MEMBER_TOKEN_TTL_SECONDS ?? 60 * 60 * 24 * 30);
  const payload: MemberTokenPayload = {
    sub: String(user.id),
    wxOpenid: user.wxOpenid ?? undefined,
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
  };
  const encodedPayload = encode(payload);
  const signature = sign(encodedPayload);
  return {
    token: `${encodedPayload}.${signature}`,
    expiresAt: new Date(payload.exp * 1000).toISOString(),
  };
}

export function verifyMemberToken(token: string): MemberTokenPayload | null {
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

function encode(payload: MemberTokenPayload): string {
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
}

function decode(value: string): MemberTokenPayload | null {
  try {
    return JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as MemberTokenPayload;
  } catch {
    return null;
  }
}

function sign(value: string): string {
  return createHmac('sha256', process.env.MEMBER_AUTH_SECRET ?? 'dev-member-auth-secret')
    .update(value)
    .digest('base64url');
}

function safeEqual(actual: string, expected: string): boolean {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}
