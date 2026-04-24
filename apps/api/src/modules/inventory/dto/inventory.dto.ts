import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateWarehouseDto {
  @IsString()
  name!: string;

  @IsString()
  code!: string;

  @IsString()
  type!: string;

  @IsOptional()
  @IsInt()
  managerId?: number;

  @IsOptional()
  @IsString()
  status?: string;
}

export class UpdateWarehouseDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsInt()
  managerId?: number;

  @IsOptional()
  @IsString()
  status?: string;
}

export class CreateStockMovementDto {
  @IsString()
  movementType!: 'in' | 'out' | 'adjust';

  @IsInt()
  warehouseId!: number;

  @IsInt()
  materialId!: number;

  @IsNumber()
  @Min(0)
  qty!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  unitCost?: number;

  @IsOptional()
  @IsString()
  refType?: string;

  @IsOptional()
  @IsInt()
  refId?: number;

  @IsOptional()
  @IsInt()
  operatorId?: number;
}
