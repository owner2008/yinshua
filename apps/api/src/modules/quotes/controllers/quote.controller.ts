import { Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { CreateQuoteDto } from '../dto/create-quote.dto';
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
  create(@Body() dto: CreateQuoteDto) {
    return this.quotes.create(dto);
  }

  @Get('admin/quotes')
  findAll() {
    return this.quotes.findAll();
  }

  @Get('admin/quotes/:quoteNo')
  async findOne(@Param('quoteNo') quoteNo: string) {
    const quote = await this.quotes.findOne(quoteNo);
    if (!quote) {
      throw new NotFoundException('报价单不存在');
    }

    return quote;
  }

  @Get('admin/quote-snapshots/:quoteNo')
  async findSnapshot(@Param('quoteNo') quoteNo: string) {
    const quote = await this.quotes.findOne(quoteNo);
    const snapshot = quote?.snapshot ?? this.snapshots.findByQuoteNo(quoteNo);
    if (!snapshot) {
      throw new NotFoundException('报价快照不存在');
    }

    return snapshot;
  }
}
