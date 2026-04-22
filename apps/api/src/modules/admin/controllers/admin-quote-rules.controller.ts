import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { AdminAuthGuard } from '../../auth/admin-auth.guard';
import { RequireAdminPermission } from '../../auth/admin-permission.decorator';
import {
  CreateQuoteRuleDto,
  CreateQuoteRuleSetDto,
  UpdateQuoteRuleDto,
  UpdateQuoteRuleSetDto,
} from '../dto/admin-quote-rule.dto';
import { AdminQuoteRulesService } from '../services/admin-quote-rules.service';

@Controller('admin')
export class AdminQuoteRulesController {
  constructor(private readonly rules: AdminQuoteRulesService) {}

  @Get('quote-rule-sets')
  findRuleSets() {
    return this.rules.findRuleSets();
  }

  @Post('quote-rule-sets')
  @UseGuards(AdminAuthGuard)
  @RequireAdminPermission('admin:quote-rule')
  createRuleSet(@Body() dto: CreateQuoteRuleSetDto) {
    return this.rules.createRuleSet(dto);
  }

  @Put('quote-rule-sets/:id')
  @UseGuards(AdminAuthGuard)
  @RequireAdminPermission('admin:quote-rule')
  updateRuleSet(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateQuoteRuleSetDto) {
    return this.rules.updateRuleSet(id, dto);
  }

  @Get('quote-rules')
  findRules() {
    return this.rules.findRules();
  }

  @Post('quote-rules')
  @UseGuards(AdminAuthGuard)
  @RequireAdminPermission('admin:quote-rule')
  createRule(@Body() dto: CreateQuoteRuleDto) {
    return this.rules.createRule(dto);
  }

  @Put('quote-rules/:id')
  @UseGuards(AdminAuthGuard)
  @RequireAdminPermission('admin:quote-rule')
  updateRule(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateQuoteRuleDto) {
    return this.rules.updateRule(id, dto);
  }
}
