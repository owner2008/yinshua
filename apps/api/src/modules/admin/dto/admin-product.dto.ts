import { IsArray, IsBoolean, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @IsOptional()
  @IsInt()
  categoryId?: number;

  @IsString()
  name!: string;

  @IsString()
  code!: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  applicationScenario?: string;
}

export class UpdateProductDto {
  @IsOptional()
  @IsInt()
  categoryId?: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  applicationScenario?: string;

  @IsOptional()
  @IsString()
  status?: string;
}

export class CreateProductTemplateDto {
  @IsInt()
  productId!: number;

  @IsString()
  templateName!: string;

  @IsNumber()
  @Min(1)
  widthMin!: number;

  @IsNumber()
  @Min(1)
  widthMax!: number;

  @IsNumber()
  @Min(1)
  heightMin!: number;

  @IsNumber()
  @Min(1)
  heightMax!: number;

  @IsInt()
  @Min(1)
  quantityMin!: number;

  @IsInt()
  @Min(1)
  quantityMax!: number;

  @IsOptional()
  @IsBoolean()
  allowCustomShape?: boolean;

  @IsOptional()
  @IsBoolean()
  allowLamination?: boolean;

  @IsOptional()
  @IsBoolean()
  allowHotStamping?: boolean;

  @IsOptional()
  @IsBoolean()
  allowUv?: boolean;

  @IsOptional()
  @IsBoolean()
  allowDieCut?: boolean;

  @IsOptional()
  @IsBoolean()
  allowProofing?: boolean;

  @IsOptional()
  @IsNumber()
  defaultLossRate?: number;

  @IsOptional()
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @IsArray()
  materialIds?: number[];

  @IsOptional()
  @IsArray()
  processCodes?: string[];

  @IsOptional()
  @IsArray()
  printModes?: string[];

  @IsOptional()
  @IsArray()
  shapeTypes?: string[];
}

export class UpdateProductTemplateDto extends CreateProductTemplateDto {}
