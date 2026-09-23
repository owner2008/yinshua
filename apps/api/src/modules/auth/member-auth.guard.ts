import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { verifyMemberToken } from './member-token';
import { mockWechatLoginEnabled } from './mock-wechat-login';

@Injectable()
export class MemberAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const header = request.headers.authorization as string | undefined;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : '';
    const payload = token ? verifyMemberToken(token) : null;
    if (!payload) {
      throw new UnauthorizedException('请先登录');
    }
    if (payload.wxOpenid?.startsWith('mock_') && !mockWechatLoginEnabled()) {
      throw new UnauthorizedException('开发模拟登录已禁用');
    }

    request.member = {
      userId: Number(payload.sub),
      wxOpenid: payload.wxOpenid,
    };
    return true;
  }
}
