import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAdminMemberDto {
  @IsOptional()
  @IsString()
  wxOpenid?: string;

  @IsOptional()
  @IsString()
  mobile?: string;

  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  customerType?: string;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  contactName?: string;

  @IsOptional()
  @IsString()
  taxNo?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsInt()
  levelId?: number;

  @IsOptional()
  @IsString()
  remark?: string;
}

export class UpdateAdminMemberDto extends CreateAdminMemberDto {}

export class CreateMemberLevelDto {
  @IsString()
  name!: string;

  @IsString()
  code!: string;

  @IsOptional()
  @IsNumber()
  discountRate?: number;

  @IsOptional()
  @IsInt()
  priority?: number;

  @IsOptional()
  @IsString()
  remark?: string;
}

export class UpdateMemberLevelDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  discountRate?: number;

  @IsOptional()
  @IsInt()
  priority?: number;

  @IsOptional()
  @IsString()
  remark?: string;
}
