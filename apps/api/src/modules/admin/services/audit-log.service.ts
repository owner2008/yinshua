import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';

export interface AuditLogInput {
  module: string;
  action: string;
  targetType: string;
  targetId?: bigint | number | null;
  before?: unknown;
  after?: unknown;
  operatorId?: bigint | number | null;
}

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async record(input: AuditLogInput) {
    if (!process.env.DATABASE_URL) {
      return;
    }

    try {
      await this.prisma.operationLog.create({
        data: {
          module: input.module,
          action: input.action,
          targetType: input.targetType,
          targetId: input.targetId == null ? undefined : BigInt(input.targetId),
          operatorId: input.operatorId == null ? undefined : BigInt(input.operatorId),
          beforeJson: input.before == null ? undefined : toJson(input.before),
          afterJson: input.after == null ? undefined : toJson(input.after),
        },
      });
    } catch {
      // 审计日志不能阻断主业务，数据库异常时交由主流程继续。
    }
  }

  findAll() {
    return this.prisma.operationLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }
}

function toJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(
    JSON.stringify(value, (_, nestedValue) =>
      typeof nestedValue === 'bigint' ? nestedValue.toString() : nestedValue,
    ),
  ) as Prisma.InputJsonValue;
}
