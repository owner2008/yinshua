import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export const quoteStatusValues = ['draft', 'pending_follow', 'contacted', 'won', 'void'] as const;
export type QuoteStatusValue = (typeof quoteStatusValues)[number];

export class UpdateQuoteStatusDto {
  @IsIn(quoteStatusValues)
  status!: QuoteStatusValue;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  followRemark?: string;
}
