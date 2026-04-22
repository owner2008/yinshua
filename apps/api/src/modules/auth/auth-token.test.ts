import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createAdminToken, verifyAdminToken } from './admin-token';
import { createMemberToken, verifyMemberToken } from './member-token';

describe('admin token', () => {
  it('round-trips a signed admin token and rejects tampering', () => {
    const auth = createAdminToken('admin', ['admin:product']);

    assert.deepEqual(verifyAdminToken(auth.token)?.permissions, ['admin:product']);
    assert.equal(verifyAdminToken(`${auth.token}x`), null);
  });
});

describe('member token', () => {
  it('round-trips a signed member token and rejects tampering', () => {
    const auth = createMemberToken({ id: 12n, wxOpenid: 'mock_12' });

    assert.equal(verifyMemberToken(auth.token)?.sub, '12');
    assert.equal(verifyMemberToken(auth.token)?.wxOpenid, 'mock_12');
    assert.equal(verifyMemberToken(`${auth.token.slice(0, -1)}x`), null);
  });
});
