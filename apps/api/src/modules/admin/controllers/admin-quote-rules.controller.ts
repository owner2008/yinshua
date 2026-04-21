import { Body, Controller, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
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
  createRuleSet(@Body() dto: CreateQuoteRuleSetDto) {
    return this.rules.createRuleSet(dto);
  }

  @Put('quote-rule-sets/:id')
  updateRuleSet(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateQuoteRuleSetDto) {
    return this.rules.updateRuleSet(id, dto);
  }

  @Get('quote-rules')
  findRules() {
    return this.rules.findRules();
  }

  @Post('quote-rules')
  createRule(@Body() dto: CreateQuoteRuleDto) {
    return this.rules.createRule(dto);
  }

  @Put('quote-rules/:id')
  updateRule(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateQuoteRuleDto) {
    return this.rules.updateRule(id, dto);
  }
}
