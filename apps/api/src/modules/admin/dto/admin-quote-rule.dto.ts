import { IsBoolean, IsInt, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateQuoteRuleSetDto {
  @IsInt()
  productTemplateId!: number;

  @IsString()
  name!: string;

  @IsString()
  scene!: string;

  @IsOptional()
  @IsInt()
  priority?: number;

  @IsString()
  versionNo!: string;

  @IsOptional()
  @IsString()
  status?: string;
}

export class UpdateQuoteRuleSetDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  scene?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsInt()
  priority?: number;

  @IsOptional()
  @IsString()
  versionNo?: string;
}

export class CreateQuoteRuleDto {
  @IsInt()
  ruleSetId!: number;

  @IsObject()
  conditionJson!: Record<string, unknown>;

  @IsObject()
  configJson!: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

export class UpdateQuoteRuleDto {
  @IsOptional()
  @IsObject()
  conditionJson?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  configJson?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
