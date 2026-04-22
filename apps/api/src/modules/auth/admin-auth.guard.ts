import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ADMIN_PERMISSION_KEY } from './admin-permission.decorator';
import { verifyAdminToken } from './admin-token';

interface RequestLike {
  headers: {
    authorization?: string;
  };
}

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestLike>();
    const token = extractBearerToken(request.headers.authorization);
    const payload = token ? verifyAdminToken(token) : null;
    if (!payload) {
      throw new UnauthorizedException('后台登录已失效，请重新登录');
    }

    const requiredPermission = this.reflector.getAllAndOverride<string>(ADMIN_PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (requiredPermission && !payload.permissions.includes(requiredPermission)) {
      throw new ForbiddenException('当前账号无权执行该操作');
    }

    return true;
  }
}

function extractBearerToken(value?: string): string | null {
  const [type, token] = value?.split(' ') ?? [];
  return type === 'Bearer' && token ? token : null;
}
