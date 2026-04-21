import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateQuoteDto } from '../dto/create-quote.dto';
import { MatchedQuoteConfig } from '../interfaces/pricing-config.interface';
import { QuoteConfigRepository } from './quote-config.repository';

@Injectable()
export class QuoteRuleMatcherService {
  constructor(private readonly repository: QuoteConfigRepository) {}

  async match(dto: CreateQuoteDto): Promise<MatchedQuoteConfig> {
    try {
      return await this.repository.getMatchedConfig(dto);
    } catch (error) {
      throw new BadRequestException(error instanceof Error ? error.message : '报价规则匹配失败');
    }
  }
}
