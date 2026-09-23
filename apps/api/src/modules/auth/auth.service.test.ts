import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { afterEach, describe, it } from 'node:test';
import { ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { verifyAdminToken } from './admin-token';

const originalAppid = process.env.WECHAT_APPID;
const originalSecret = process.env.WECHAT_APP_SECRET;
const originalMockFlag = process.env.ALLOW_MOCK_WECHAT_LOGIN;
const originalNodeEnv = process.env.NODE_ENV;
const originalAdminUsername = process.env.ADMIN_USERNAME;
const originalAdminPassword = process.env.ADMIN_PASSWORD;

describe('AuthService adminLogin safety', () => {
  afterEach(() => {
    restoreWechatEnv();
  });

  it('never falls back to an environment or default admin account', async () => {
    process.env.ADMIN_USERNAME = 'admin';
    process.env.ADMIN_PASSWORD = 'admin123';
    const service = new AuthService({ adminUser: { findUnique: async () => null } } as never);

    await assert.rejects(() => service.adminLogin({ username: 'admin', password: 'admin123' }), UnauthorizedException);
  });

  it('fails closed when the admin database is unavailable', async () => {
    const service = new AuthService({ adminUser: { findUnique: async () => { throw new Error('db unavailable'); } } } as never);

    await assert.rejects(() => service.adminLogin({ username: 'admin', password: 'admin123' }), ServiceUnavailableException);
  });

  it('does not grant permissions to an admin without assigned roles', async () => {
    const salt = 'integration-salt';
    const digest = createHash('sha256').update(`${salt}:test-password`).digest('hex');
    const prisma = {
      adminUser: {
        findUnique: async () => ({ id: 1n, username: 'limited', status: 'active', passwordHash: `sha256:${salt}:${digest}`, roles: [] }),
        update: async () => ({}),
      },
    };
    const service = new AuthService(prisma as never);

    const result = await service.adminLogin({ username: 'limited', password: 'test-password' });
    assert.deepEqual(result.permissions, []);
    assert.deepEqual(verifyAdminToken(result.token)?.permissions, []);
  });
});

describe('AuthService wxLogin configuration', () => {
  afterEach(() => {
    restoreWechatEnv();
  });

  it('rejects real wx.login codes when WeChat credentials are missing', async () => {
    delete process.env.WECHAT_APPID;
    delete process.env.WECHAT_APP_SECRET;
    const service = new AuthService({} as never);

    await assert.rejects(
      () => service.wxLogin({ code: 'real-wx-code' }),
      UnauthorizedException,
    );
  });

  it('keeps explicit mock codes available for local development', async () => {
    delete process.env.WECHAT_APPID;
    delete process.env.WECHAT_APP_SECRET;
    process.env.ALLOW_MOCK_WECHAT_LOGIN = 'true';
    process.env.NODE_ENV = 'development';
    let upsertOpenid = '';
    const prisma = {
      user: {
        upsert: async ({ where }: { where: { wxOpenid: string } }) => {
          upsertOpenid = where.wxOpenid;
          return { id: 8n, wxOpenid: where.wxOpenid };
        },
      },
    };
    const service = new AuthService(prisma as never);

    const session = await service.wxLogin({ code: 'mock_8' });

    assert.equal(upsertOpenid, 'mock_8');
    assert.equal(session.user.wxOpenid, 'mock_8');
    assert.equal(typeof session.token, 'string');
  });

  it('rejects mock codes unless local development explicitly enables them', async () => {
    delete process.env.ALLOW_MOCK_WECHAT_LOGIN;
    const service = new AuthService({} as never);

    await assert.rejects(() => service.wxLogin({ code: 'mock_shared' }), UnauthorizedException);
  });

  it('rejects mock codes in production even when the flag is enabled', async () => {
    process.env.ALLOW_MOCK_WECHAT_LOGIN = 'true';
    process.env.NODE_ENV = 'production';
    const service = new AuthService({} as never);

    await assert.rejects(() => service.wxLogin({ code: 'mock_shared' }), UnauthorizedException);
  });
});

function restoreWechatEnv() {
  if (originalAppid === undefined) {
    delete process.env.WECHAT_APPID;
  } else {
    process.env.WECHAT_APPID = originalAppid;
  }
  if (originalSecret === undefined) {
    delete process.env.WECHAT_APP_SECRET;
  } else {
    process.env.WECHAT_APP_SECRET = originalSecret;
  }
  if (originalMockFlag === undefined) {
    delete process.env.ALLOW_MOCK_WECHAT_LOGIN;
  } else {
    process.env.ALLOW_MOCK_WECHAT_LOGIN = originalMockFlag;
  }
  if (originalNodeEnv === undefined) {
    delete process.env.NODE_ENV;
  } else {
    process.env.NODE_ENV = originalNodeEnv;
  }
  if (originalAdminUsername === undefined) delete process.env.ADMIN_USERNAME;
  else process.env.ADMIN_USERNAME = originalAdminUsername;
  if (originalAdminPassword === undefined) delete process.env.ADMIN_PASSWORD;
  else process.env.ADMIN_PASSWORD = originalAdminPassword;
}
