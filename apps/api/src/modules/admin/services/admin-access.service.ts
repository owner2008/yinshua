import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { createHash, randomBytes } from 'node:crypto';
import { PrismaService } from '../../../database/prisma.service';
import {
  CreateAdminRoleDto,
  CreateAdminUserDto,
  UpdateAdminRoleDto,
  UpdateAdminUserDto,
} from '../dto/admin-access.dto';
import { AuditLogService } from './audit-log.service';

@Injectable()
export class AdminAccessService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLogService,
  ) {}

  findUsers() {
    return this.prisma.adminUser.findMany({
      orderBy: { id: 'desc' },
      include: { roles: { include: { role: true } } },
    }).then((users) => users.map(safeAdminUser));
  }

  findRoles() {
    return this.prisma.adminRole.findMany({
      orderBy: { id: 'asc' },
      include: {
        permissions: { include: { permission: true } },
        users: true,
      },
    });
  }

  findPermissions() {
    return this.prisma.adminPermission.findMany({
      orderBy: [{ module: 'asc' }, { code: 'asc' }],
    });
  }

  async createUser(dto: CreateAdminUserDto) {
    const user = await this.prisma.$transaction(async (tx) => {
      const created = await tx.adminUser.create({
        data: {
          username: dto.username,
          displayName: dto.displayName,
          passwordHash: hashPassword(dto.password),
        },
      });
      await replaceUserRoles(tx, created.id, dto.roleIds ?? []);
      return tx.adminUser.findUniqueOrThrow({
        where: { id: created.id },
        include: { roles: { include: { role: true } } },
      });
    });
    await this.audit.record({
      module: 'admin-access',
      action: 'create-user',
      targetType: 'admin-user',
      targetId: user.id,
      after: safeAdminUser(user),
    });
    return safeAdminUser(user);
  }

  async updateUser(id: number, dto: UpdateAdminUserDto) {
    const before = await this.prisma.adminUser.findUnique({
      where: { id: BigInt(id) },
      include: { roles: { include: { role: true } } },
    });
    if (!before) {
      throw new BadRequestException('管理员不存在');
    }

    const user = await this.prisma.$transaction(async (tx) => {
      await ensurePermissionManagerRemains(tx, {
        userId: BigInt(id),
        nextUserStatus: dto.status,
        nextUserRoleIds: dto.roleIds,
      });
      await tx.adminUser.update({
        where: { id: BigInt(id) },
        data: {
          displayName: dto.displayName,
          status: dto.status,
          passwordHash: dto.password ? hashPassword(dto.password) : undefined,
        },
      });
      if (dto.roleIds) {
        await replaceUserRoles(tx, BigInt(id), dto.roleIds);
      }
      return tx.adminUser.findUniqueOrThrow({
        where: { id: BigInt(id) },
        include: { roles: { include: { role: true } } },
      });
    });
    await this.audit.record({
      module: 'admin-access',
      action: 'update-user',
      targetType: 'admin-user',
      targetId: user.id,
      before: safeAdminUser(before),
      after: safeAdminUser(user),
    });
    return safeAdminUser(user);
  }

  async createRole(dto: CreateAdminRoleDto) {
    const role = await this.prisma.$transaction(async (tx) => {
      const created = await tx.adminRole.create({
        data: {
          code: dto.code,
          name: dto.name,
          description: dto.description,
        },
      });
      await replaceRolePermissions(tx, created.id, dto.permissionIds ?? []);
      return tx.adminRole.findUniqueOrThrow({
        where: { id: created.id },
        include: { permissions: { include: { permission: true } }, users: true },
      });
    });
    await this.audit.record({
      module: 'admin-access',
      action: 'create-role',
      targetType: 'admin-role',
      targetId: role.id,
      after: role,
    });
    return role;
  }

  async updateRole(id: number, dto: UpdateAdminRoleDto) {
    const before = await this.prisma.adminRole.findUnique({
      where: { id: BigInt(id) },
      include: { permissions: { include: { permission: true } }, users: true },
    });
    if (!before) {
      throw new BadRequestException('角色不存在');
    }

    const role = await this.prisma.$transaction(async (tx) => {
      await ensurePermissionManagerRemains(tx, {
        roleId: BigInt(id),
        nextRoleStatus: dto.status,
        nextRolePermissionIds: dto.permissionIds,
      });
      await tx.adminRole.update({
        where: { id: BigInt(id) },
        data: {
          name: dto.name,
          description: dto.description,
          status: dto.status,
        },
      });
      if (dto.permissionIds) {
        await replaceRolePermissions(tx, BigInt(id), dto.permissionIds);
      }
      return tx.adminRole.findUniqueOrThrow({
        where: { id: BigInt(id) },
        include: { permissions: { include: { permission: true } }, users: true },
      });
    });
    await this.audit.record({
      module: 'admin-access',
      action: 'update-role',
      targetType: 'admin-role',
      targetId: role.id,
      before,
      after: role,
    });
    return role;
  }
}

type TxClient = Prisma.TransactionClient;

async function replaceUserRoles(tx: TxClient, adminUserId: bigint, roleIds: number[]) {
  await tx.adminUserRole.deleteMany({ where: { adminUserId } });
  if (roleIds.length === 0) {
    return;
  }

  await tx.adminUserRole.createMany({
    data: roleIds.map((roleId) => ({ adminUserId, roleId: BigInt(roleId) })),
    skipDuplicates: true,
  });
}

async function replaceRolePermissions(tx: TxClient, roleId: bigint, permissionIds: number[]) {
  await tx.adminRolePermission.deleteMany({ where: { roleId } });
  if (permissionIds.length === 0) {
    return;
  }

  await tx.adminRolePermission.createMany({
    data: permissionIds.map((permissionId) => ({ roleId, permissionId: BigInt(permissionId) })),
    skipDuplicates: true,
  });
}

interface PermissionManagerChange {
  userId?: bigint;
  nextUserStatus?: string;
  nextUserRoleIds?: number[];
  roleId?: bigint;
  nextRoleStatus?: string;
  nextRolePermissionIds?: number[];
}

async function ensurePermissionManagerRemains(tx: TxClient, change: PermissionManagerChange) {
  const permission = await tx.adminPermission.findUnique({ where: { code: 'admin:permission' } });
  if (!permission) {
    return;
  }

  const users = await tx.adminUser.findMany({
    where: { status: 'active' },
    include: { roles: true },
  });
  const roles = await tx.adminRole.findMany({
    include: { permissions: true },
  });
  const roleById = new Map(roles.map((role) => [role.id.toString(), role]));

  const hasManager = users.some((user) => {
    const userStatus = change.userId === user.id ? change.nextUserStatus ?? user.status : user.status;
    if (userStatus !== 'active') {
      return false;
    }

    const roleLinks =
      change.userId === user.id && change.nextUserRoleIds
        ? change.nextUserRoleIds.map((roleId) => BigInt(roleId))
        : user.roles.map((link) => link.roleId);

    return roleLinks.some((roleId) => {
      const role = roleById.get(roleId.toString());
      if (!role) {
        return false;
      }

      const roleStatus = change.roleId === role.id ? change.nextRoleStatus ?? role.status : role.status;
      if (roleStatus !== 'active') {
        return false;
      }

      if (change.roleId === role.id && change.nextRolePermissionIds) {
        return change.nextRolePermissionIds.some((id) => BigInt(id) === permission.id);
      }

      return role.permissions.some((item) => item.permissionId === permission.id);
    });
  });

  if (!hasManager) {
    throw new BadRequestException('至少需要保留一个启用的权限管理员');
  }
}

function safeAdminUser<T extends { passwordHash: string }>(user: T): Omit<T, 'passwordHash'> {
  const { passwordHash: _passwordHash, ...rest } = user;
  return rest;
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const digest = createHash('sha256').update(`${salt}:${password}`).digest('hex');
  return `sha256:${salt}:${digest}`;
}
