import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { verifyMemberToken } from './member-token';

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

    request.member = {
      userId: Number(payload.sub),
      wxOpenid: payload.wxOpenid,
    };
    return true;
  }
}
