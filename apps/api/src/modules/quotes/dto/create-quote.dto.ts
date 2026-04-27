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
  MaxLength,
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

  @IsOptional()
  @IsString()
  @MaxLength(64)
  deliveryForm?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  labelingMethod?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  rollDirection?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  rollCoreMm?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  piecesPerRoll?: number;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  adhesiveType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  usageEnvironment?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  surfaceFinish?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  colorMode?: string;

  @IsOptional()
  @IsBoolean()
  hasDesignFile?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  designFileUrl?: string;

  @IsOptional()
  @IsBoolean()
  needDesignService?: boolean;

  @IsOptional()
  @IsBoolean()
  needSampleApproval?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  packagingMethod?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  expectedDeliveryDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  quoteRemark?: string;
}
