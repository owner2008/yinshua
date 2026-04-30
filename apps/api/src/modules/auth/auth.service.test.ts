import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

const originalAppid = process.env.WECHAT_APPID;
const originalSecret = process.env.WECHAT_APP_SECRET;

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
}
