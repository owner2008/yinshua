import { Module } from '@nestjs/common';
import { QuoteController } from './controllers/quote.controller';
import { QuoteCalcService } from './services/quote-calc.service';
import { QuoteRuleMatcherService } from './services/quote-rule-matcher.service';
import { QuoteService } from './services/quote.service';
import { QuoteConfigRepository } from './services/quote-config.repository';
import { QuoteSnapshotService } from './services/quote-snapshot.service';
import { QuoteValidatorService } from './services/quote-validator.service';

@Module({
  controllers: [QuoteController],
  providers: [
    QuoteService,
    QuoteConfigRepository,
    QuoteValidatorService,
    QuoteRuleMatcherService,
    QuoteCalcService,
    QuoteSnapshotService,
  ],
})
export class QuotesModule {}
