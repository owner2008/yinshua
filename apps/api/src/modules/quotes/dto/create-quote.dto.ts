import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class CreateQuoteDto {
  @IsInt()
  @IsPositive()
  productId!: number;

  @IsInt()
  @IsPositive()
  productTemplateId!: number;

  @IsNumber()
  @Min(1)
  widthMm!: number;

  @IsNumber()
  @Min(1)
  heightMm!: number;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsInt()
  @IsPositive()
  materialId!: number;

  @IsString()
  printMode!: string;

  @IsString()
  shapeType!: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  processCodes!: string[];

  @IsOptional()
  @IsString()
  laminationType?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  hotStampAreaMm2?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  uvAreaMm2?: number;

  @IsOptional()
  @IsBoolean()
  isProofing?: boolean;

  @IsOptional()
  @IsBoolean()
  isUrgent?: boolean;

  @IsOptional()
  @IsString()
  shippingRegionCode?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  memberId?: number;

  @IsOptional()
  @IsIn(['personal', 'company'])
  customerType?: 'personal' | 'company';
}
