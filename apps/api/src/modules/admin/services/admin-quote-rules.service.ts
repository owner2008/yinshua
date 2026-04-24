import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import {
  CreateQuoteRuleDto,
  CreateQuoteRuleSetDto,
  UpdateQuoteRuleDto,
  UpdateQuoteRuleSetDto,
} from '../dto/admin-quote-rule.dto';
import { AuditLogService } from './audit-log.service';

@Injectable()
export class AdminQuoteRulesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLogService,
  ) {}

  findRuleSets() {
    return this.prisma.quoteRuleSet.findMany({
      orderBy: [{ productTemplateId: 'asc' }, { priority: 'desc' }],
      include: { template: true, rules: true },
    });
  }

  async createRuleSet(dto: CreateQuoteRuleSetDto) {
    const ruleSet = await this.prisma.quoteRuleSet.create({
      data: {
        productTemplateId: BigInt(dto.productTemplateId),
        name: dto.name,
        scene: dto.scene,
        priority: dto.priority ?? 0,
        versionNo: dto.versionNo,
        status: dto.status,
        effectiveFrom: new Date(),
      },
    });
    await this.audit.record({
      module: 'quote-rule-set',
      action: 'create',
      targetType: 'quote_rule_set',
      targetId: ruleSet.id,
      after: ruleSet,
    });
    return ruleSet;
  }

  async updateRuleSet(id: number, dto: UpdateQuoteRuleSetDto) {
    const before = await this.ensureRuleSet(id);
    const after = await this.prisma.quoteRuleSet.update({
      where: { id: BigInt(id) },
      data: {
        name: dto.name,
        scene: dto.scene,
        status: dto.status,
        priority: dto.priority,
        versionNo: dto.versionNo,
      },
    });
    await this.audit.record({
      module: 'quote-rule-set',
      action: 'update',
      targetType: 'quote_rule_set',
      targetId: after.id,
      before,
      after,
    });
    return after;
  }

  findRules() {
    return this.prisma.quoteRule.findMany({
      orderBy: { id: 'desc' },
      include: { ruleSet: true },
    });
  }

  async createRule(dto: CreateQuoteRuleDto) {
    await this.ensureRuleSet(dto.ruleSetId);
    const rule = await this.prisma.quoteRule.create({
      data: {
        ruleSetId: BigInt(dto.ruleSetId),
        conditionJson: toJson(dto.conditionJson),
        configJson: toJson(dto.configJson),
        enabled: dto.enabled ?? true,
      },
    });
    await this.audit.record({
      module: 'quote-rule',
      action: 'create',
      targetType: 'quote_rule',
      targetId: rule.id,
      after: rule,
    });
    return rule;
  }

  async updateRule(id: number, dto: UpdateQuoteRuleDto) {
    const before = await this.ensureRule(id);
    const after = await this.prisma.quoteRule.update({
      where: { id: BigInt(id) },
      data: {
        conditionJson: dto.conditionJson ? toJson(dto.conditionJson) : undefined,
        configJson: dto.configJson ? toJson(dto.configJson) : undefined,
        enabled: dto.enabled,
      },
    });
    await this.audit.record({
      module: 'quote-rule',
      action: 'update',
      targetType: 'quote_rule',
      targetId: after.id,
      before,
      after,
    });
    return after;
  }

  private async ensureRuleSet(id: number) {
    const ruleSet = await this.prisma.quoteRuleSet.findUnique({ where: { id: BigInt(id) } });
    if (!ruleSet) {
      throw new NotFoundException('报价规则集不存在');
    }
    return ruleSet;
  }

  private async ensureRule(id: number) {
    const rule = await this.prisma.quoteRule.findUnique({ where: { id: BigInt(id) } });
    if (!rule) {
      throw new NotFoundException('报价规则不存在');
    }
    return rule;
  }
}

function toJson(value: Record<string, unknown>): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}
