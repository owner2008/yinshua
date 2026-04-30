import { Body, Controller, Get, NotFoundException, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AdminAuthGuard } from '../../auth/admin-auth.guard';
import { CurrentMember } from '../../auth/current-member.decorator';
import { RequireAdminPermission } from '../../auth/admin-permission.decorator';
import { MemberAuthGuard } from '../../auth/member-auth.guard';
import { CreateQuoteDto } from '../dto/create-quote.dto';
import { UpdateQuoteStatusDto } from '../dto/update-quote-status.dto';
import { QuoteService } from '../services/quote.service';
import { QuoteSnapshotService } from '../services/quote-snapshot.service';

@Controller()
export class QuoteController {
  constructor(
    private readonly quotes: QuoteService,
    private readonly snapshots: QuoteSnapshotService,
  ) {}

  @Post('quotes/calculate')
  calculate(@Body() dto: CreateQuoteDto) {
    return this.quotes.calculate(dto);
  }

  @Post('quotes')
  @UseGuards(MemberAuthGuard)
  create(@Body() dto: CreateQuoteDto, @CurrentMember() member: CurrentMember) {
    return this.quotes.create(dto, member.userId);
  }

  @Post('admin/quotes/preview')
  @UseGuards(AdminAuthGuard)
  @RequireAdminPermission('admin:quote-rule')
  preview(@Body() dto: CreateQuoteDto) {
    return this.quotes.preview(dto);
  }

  @Get('admin/quotes')
  @UseGuards(AdminAuthGuard)
  @RequireAdminPermission('admin:quote')
  findAll() {
    return this.quotes.findAll();
  }

  @Get('admin/quotes/:quoteNo')
  @UseGuards(AdminAuthGuard)
  @RequireAdminPermission('admin:quote')
  async findOne(@Param('quoteNo') quoteNo: string) {
    const quote = await this.quotes.findOne(quoteNo);
    if (!quote) {
      throw new NotFoundException('报价单不存在');
    }

    return quote;
  }

  @Put('admin/quotes/:quoteNo/status')
  @UseGuards(AdminAuthGuard)
  @RequireAdminPermission('admin:quote')
  async updateStatus(@Param('quoteNo') quoteNo: string, @Body() dto: UpdateQuoteStatusDto) {
    const quote = await this.quotes.updateAdminStatus(quoteNo, dto);
    if (!quote) {
      throw new NotFoundException('报价单不存在');
    }

    return quote;
  }

  @Get('admin/quote-snapshots/:quoteNo')
  @UseGuards(AdminAuthGuard)
  @RequireAdminPermission('admin:quote')
  async findSnapshot(@Param('quoteNo') quoteNo: string) {
    const quote = await this.quotes.findOne(quoteNo);
    const snapshot = quote?.snapshot ?? this.snapshots.findByQuoteNo(quoteNo);
    if (!snapshot) {
      throw new NotFoundException('报价快照不存在');
    }

    return snapshot;
  }
}
