import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BadRequestException } from '@nestjs/common';
import { AdminAccessService } from './admin-access.service';

describe('AdminAccessService self protection', () => {
  it('rejects disabling the last active permission manager', async () => {
    const service = new AdminAccessService(prismaStub(), auditStub());

    await assert.rejects(
      () => service.updateUser(1, { status: 'disabled' }),
      (error) => error instanceof BadRequestException,
    );
  });

  it('rejects removing admin:permission from the last active permission role', async () => {
    const service = new AdminAccessService(prismaStub(), auditStub());

    await assert.rejects(
      () => service.updateRole(1, { permissionIds: [] }),
      (error) => error instanceof BadRequestException,
    );
  });
});

function prismaStub() {
  const tx = {
    adminPermission: {
      findUnique: async () => ({ id: 7n, code: 'admin:permission' }),
    },
    adminUser: {
      findMany: async () => [{ id: 1n, status: 'active', roles: [{ roleId: 1n }] }],
      update: async () => undefined,
      findUniqueOrThrow: async () => adminUser(),
    },
    adminRole: {
      findMany: async () => [
        {
          id: 1n,
          status: 'active',
          permissions: [{ permissionId: 7n }],
        },
      ],
      update: async () => undefined,
      findUniqueOrThrow: async () => adminRole(),
    },
    adminUserRole: {
      deleteMany: async () => undefined,
      createMany: async () => undefined,
    },
    adminRolePermission: {
      deleteMany: async () => undefined,
      createMany: async () => undefined,
    },
  };

  return {
    adminUser: {
      findUnique: async () => adminUser(),
    },
    adminRole: {
      findUnique: async () => adminRole(),
    },
    $transaction: async (callback: (client: typeof tx) => unknown) => callback(tx),
  } as never;
}

function adminUser() {
  return {
    id: 1n,
    username: 'admin',
    displayName: '管理员',
    passwordHash: 'secret',
    status: 'active',
    roles: [{ roleId: 1n, role: { id: 1n, code: 'super_admin', name: '超级管理员' } }],
  };
}

function adminRole() {
  return {
    id: 1n,
    code: 'super_admin',
    name: '超级管理员',
    status: 'active',
    permissions: [{ permissionId: 7n, permission: { id: 7n, code: 'admin:permission' } }],
    users: [{ adminUserId: 1n }],
  };
}

function auditStub() {
  return {
    record: async () => undefined,
  } as never;
}
