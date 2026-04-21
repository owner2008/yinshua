import { Controller, Get } from '@nestjs/common';
import { AuditLogService } from '../services/audit-log.service';

@Controller('admin')
export class AdminOperationLogsController {
  constructor(private readonly logs: AuditLogService) {}

  @Get('operation-logs')
  findAll() {
    return this.logs.findAll();
  }
}
