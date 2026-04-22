import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { AdminAuthGuard } from './admin-auth.guard';
import { createAdminToken } from './admin-token';
import { MemberAuthGuard } from './member-auth.guard';
import { createMemberToken } from './member-token';

describe('AdminAuthGuard', () => {
  it('rejects missing tokens', () => {
    const guard = new AdminAuthGuard(reflector('admin:product'));

    assert.throws(() => guard.canActivate(contextWithHeaders({})), UnauthorizedException);
  });

  it('rejects tokens without the required permission', () => {
    const guard = new AdminAuthGuard(reflector('admin:pricing'));
    const auth = createAdminToken('admin', ['admin:product']);

    assert.throws(
      () => guard.canActivate(contextWithHeaders({ authorization: `Bearer ${auth.token}` })),
      ForbiddenException,
    );
  });

  it('allows tokens with the required permission', () => {
    const guard = new AdminAuthGuard(reflector('admin:product'));
    const auth = createAdminToken('admin', ['admin:product']);

    assert.equal(guard.canActivate(contextWithHeaders({ authorization: `Bearer ${auth.token}` })), true);
  });
});

describe('MemberAuthGuard', () => {
  it('attaches current member from a valid token', () => {
    const guard = new MemberAuthGuard();
    const auth = createMemberToken({ id: 3, wxOpenid: 'mock_3' });
    const request: { headers: Record<string, string>; member?: unknown } = {
      headers: { authorization: `Bearer ${auth.token}` },
    };

    assert.equal(guard.canActivate(contextWithRequest(request)), true);
    assert.deepEqual(request.member, { userId: 3, wxOpenid: 'mock_3' });
  });

  it('rejects missing member tokens', () => {
    const guard = new MemberAuthGuard();

    assert.throws(() => guard.canActivate(contextWithRequest({ headers: {} })), UnauthorizedException);
  });
});

function reflector(permission: string) {
  return {
    getAllAndOverride: () => permission,
  } as never;
}

function contextWithHeaders(headers: Record<string, string>): ExecutionContext {
  return contextWithRequest({ headers });
}

function contextWithRequest(request: Record<string, unknown>): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    getHandler: () => undefined,
    getClass: () => undefined,
  } as unknown as ExecutionContext;
}
