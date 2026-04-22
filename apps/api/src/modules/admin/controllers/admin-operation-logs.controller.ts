import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminAuthGuard } from '../../auth/admin-auth.guard';
import { RequireAdminPermission } from '../../auth/admin-permission.decorator';
import { AuditLogService } from '../services/audit-log.service';

@Controller('admin')
export class AdminOperationLogsController {
  constructor(private readonly logs: AuditLogService) {}

  @Get('operation-logs')
  @UseGuards(AdminAuthGuard)
  @RequireAdminPermission('admin:audit-log')
  findAll() {
    return this.logs.findAll();
  }
}
