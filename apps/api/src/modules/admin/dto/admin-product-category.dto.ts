import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateProductCategoryDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsInt()
  parentId?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(9999)
  sort?: number;
}

export class UpdateProductCategoryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  parentId?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(9999)
  sort?: number;

  @IsOptional()
  @IsString()
  status?: string;
}
