import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { AdminAuthGuard } from '../../auth/admin-auth.guard';
import { ADMIN_PERMISSION_KEY } from '../../auth/admin-permission.decorator';
import { QuoteController } from './quote.controller';

describe('QuoteController admin quote tool access', () => {
  it('protects quote calculation with admin quote permission', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, QuoteController.prototype.calculate) ?? [];
    const permission = Reflect.getMetadata(ADMIN_PERMISSION_KEY, QuoteController.prototype.calculate);

    assert.ok(guards.includes(AdminAuthGuard));
    assert.equal(permission, 'admin:quote');
  });

  it('does not expose member quote creation from the public controller', () => {
    assert.equal('create' in QuoteController.prototype, false);
  });
});
