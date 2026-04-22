import { SetMetadata } from '@nestjs/common';

export const ADMIN_PERMISSION_KEY = 'admin_permission';

export function RequireAdminPermission(permission: string) {
  return SetMetadata(ADMIN_PERMISSION_KEY, permission);
}
