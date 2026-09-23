import { Injectable, NotFoundException, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { createHash, timingSafeEqual } from 'node:crypto';
import { PrismaService } from '../../database/prisma.service';
import { createAdminToken } from './admin-token';
import { createMemberToken } from './member-token';
import { mockWechatLoginEnabled } from './mock-wechat-login';
import { AdminLoginDto, BindMobileDto, WxLoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async adminLogin(dto: AdminLoginDto) {
    const admin = await this.findDatabaseAdmin(dto.username);
    if (!admin || admin.status !== 'active' || !verifyPassword(dto.password, admin.passwordHash)) {
      throw new UnauthorizedException('后台账号或密码错误');
    }

    const permissions = collectPermissions(admin);
    const auth = createAdminToken(admin.username, permissions);
    await this.prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });
    return {
      ...auth,
      user: {
        username: admin.username,
        role: admin.roles[0]?.role.code ?? 'admin',
        permissions: auth.permissions,
      },
    };
  }

  private async findDatabaseAdmin(username: string) {
    try {
      return await this.prisma.adminUser.findUnique({
        where: { username },
        include: {
          roles: {
            include: {
              role: {
                include: {
                  permissions: {
                    include: { permission: true },
                  },
                },
              },
            },
          },
        },
      });
    } catch {
      throw new ServiceUnavailableException('后台账号服务暂不可用');
    }
  }

  async wxLogin(dto: WxLoginDto) {
    const wxIdentity = await resolveWxIdentity(dto.code);
    const user = await this.prisma.user.upsert({
      where: { wxOpenid: wxIdentity.openid },
      create: {
        wxOpenid: wxIdentity.openid,
        unionid: wxIdentity.unionid,
        nickname: dto.nickname,
        avatar: dto.avatar,
      },
      update: {
        unionid: wxIdentity.unionid,
        nickname: dto.nickname,
        avatar: dto.avatar,
      },
    });
    const auth = createMemberToken(user);
    return {
      ...auth,
      user,
    };
  }

  async bindMobile(userId: number, dto: BindMobileDto) {
    const user = await this.prisma.user.findUnique({ where: { id: BigInt(userId) } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return this.prisma.user.update({
      where: { id: user.id },
      data: { mobile: dto.mobile },
    });
  }
}

type DatabaseAdmin = NonNullable<Awaited<ReturnType<AuthService['findDatabaseAdmin']>>>;

function collectPermissions(admin: DatabaseAdmin): string[] {
  const permissions = admin.roles.flatMap((item) => item.role.permissions.map((rolePermission) => rolePermission.permission.code));
  return Array.from(new Set(permissions));
}

function verifyPassword(password: string, storedHash: string): boolean {
  const [algorithm, salt, digest] = storedHash.split(':');
  if (algorithm !== 'sha256' || !salt || !digest) {
    return false;
  }

  const actual = createHash('sha256').update(`${salt}:${password}`).digest('hex');
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(digest);
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

async function resolveWxIdentity(code: string): Promise<{ openid: string; unionid?: string }> {
  const appid = process.env.WECHAT_APPID;
  const secret = process.env.WECHAT_APP_SECRET;
  if (code.startsWith('mock_')) {
    if (!mockWechatLoginEnabled()) {
      throw new UnauthorizedException('开发模拟登录未启用');
    }
    return { openid: `mock_${code.replace(/^mock_/, '')}` };
  }
  if (!appid || !secret) {
    throw new UnauthorizedException('未配置微信小程序 AppID 或 AppSecret，无法使用真实微信登录');
  }

  const params = new URLSearchParams({
    appid,
    secret,
    js_code: code,
    grant_type: 'authorization_code',
  });
  const response = await fetch(`https://api.weixin.qq.com/sns/jscode2session?${params.toString()}`);
  const data = (await response.json()) as {
    openid?: string;
    unionid?: string;
    errcode?: number;
    errmsg?: string;
  };

  if (!response.ok || !data.openid) {
    throw new UnauthorizedException(data.errmsg ?? '微信登录失败');
  }

  return { openid: data.openid, unionid: data.unionid };
}
