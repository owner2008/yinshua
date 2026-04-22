import '../../../load-env';
import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { AuditLogService } from './audit-log.service';
import { AdminAccessService } from './admin-access.service';

const roleCode = 'it_permission_role';
const username = 'it_permission_user';
let prisma: PrismaService;
let service: AdminAccessService;
let permissionIds: number[];
let productPermissionId: number;

describe('admin access integration', () => {
  before(async () => {
    assert.ok(process.env.DATABASE_URL, 'DATABASE_URL is required for integration tests');
    prisma = new PrismaService();
    await prisma.$connect();
    await cleanup();
    const permissions = await prisma.adminPermission.findMany({
      where: { code: { in: ['admin:permission', 'admin:product'] } },
      orderBy: { code: 'asc' },
    });
    assert.equal(permissions.length, 2, 'seeded admin permissions are required');
    permissionIds = permissions.map((permission) => Number(permission.id));
    productPermissionId = Number(permissions.find((permission) => permission.code === 'admin:product')?.id);
    service = new AdminAccessService(prisma, new AuditLogService(prisma));
  });

  after(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  it('creates and updates roles/users with audit logs in MySQL', async () => {
    const role = await service.createRole({
      code: roleCode,
      name: '集成测试权限角色',
      description: 'integration role',
      permissionIds,
    });
    assert.equal(role.code, roleCode);
    assert.equal(role.permissions?.length, 2);

    const user = await service.createUser({
      username,
      displayName: '集成测试管理员',
      password: 'test1234',
      roleIds: [Number(role.id)],
    });
    assert.equal(user.username, username);
    assert.equal(user.roles?.[0]?.role.code, roleCode);
    assert.equal('passwordHash' in user, false);

    const updatedUser = await service.updateUser(Number(user.id), {
      displayName: '集成测试管理员已更新',
      roleIds: [Number(role.id)],
    });
    assert.equal(updatedUser.displayName, '集成测试管理员已更新');

    const updatedRole = await service.updateRole(Number(role.id), {
      name: '集成测试权限角色已更新',
      permissionIds: [productPermissionId],
    });
    assert.equal(updatedRole.name, '集成测试权限角色已更新');
    assert.equal(updatedRole.permissions?.length, 1);

    const logs = await prisma.operationLog.findMany({
      where: { module: 'admin-access', targetId: { in: [BigInt(role.id), BigInt(user.id)] } },
    });
    assert.ok(logs.some((log) => log.action === 'create-role'));
    assert.ok(logs.some((log) => log.action === 'create-user'));
    assert.ok(logs.some((log) => log.action === 'update-user'));
    assert.ok(logs.some((log) => log.action === 'update-role'));
  });

  it('keeps the last seeded permission manager protected', async () => {
    const superAdminRole = await prisma.adminRole.findUniqueOrThrow({ where: { code: 'super_admin' } });

    await assert.rejects(
      () => service.updateRole(Number(superAdminRole.id), { permissionIds: [] }),
      (error) => error instanceof BadRequestException,
    );
  });
});

async function cleanup() {
  const users = await prisma.adminUser.findMany({
    where: { username },
    select: { id: true },
  });
  const roles = await prisma.adminRole.findMany({
    where: { code: roleCode },
    select: { id: true },
  });
  const userIds = users.map((user) => user.id);
  const roleIds = roles.map((role) => role.id);
  const targetIds = [...userIds, ...roleIds];

  await prisma.operationLog.deleteMany({
    where: {
      module: 'admin-access',
      targetId: { in: targetIds },
    },
  });
  await prisma.adminUserRole.deleteMany({
    where: {
      OR: [{ adminUserId: { in: userIds } }, { roleId: { in: roleIds } }],
    },
  });
  await prisma.adminRolePermission.deleteMany({ where: { roleId: { in: roleIds } } });
  await prisma.adminUser.deleteMany({ where: { id: { in: userIds } } });
  await prisma.adminRole.deleteMany({ where: { id: { in: roleIds } } });
}
