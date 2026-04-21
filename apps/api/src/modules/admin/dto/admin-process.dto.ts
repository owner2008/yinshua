import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProcessDto {
  @IsString()
  code!: string;

  @IsString()
  name!: string;

  @IsString()
  processType!: string;

  @IsString()
  feeMode!: string;
}

export class UpdateProcessDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  processType?: string;

  @IsOptional()
  @IsString()
  feeMode?: string;

  @IsOptional()
  @IsString()
  status?: string;
}

export class CreateProcessPriceDto {
  @IsInt()
  processId!: number;

  @IsString()
  feeMode!: string;

  @IsNumber()
  @Min(0)
  unitPrice!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minFee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  setupFee?: number;
}

export class CreatePrintPriceDto {
  @IsString()
  printMode!: string;

  @IsString()
  feeMode!: string;

  @IsNumber()
  @Min(0)
  unitPrice!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  setupFee?: number;
}
