import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class RegisterMemberDto {
  @IsOptional()
  @IsString()
  mobile?: string;

  @IsOptional()
  @IsString()
  nickname?: string;

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
  @IsString()
  remark?: string;
}

export class UpsertMemberProfileDto {
  @IsOptional()
  @IsInt()
  userId!: number;

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
  remark?: string;
}

export class CreateMemberAddressDto {
  @IsOptional()
  @IsInt()
  userId!: number;

  @IsString()
  consignee!: string;

  @IsString()
  mobile!: string;

  @IsString()
  province!: string;

  @IsString()
  city!: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsString()
  detail!: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateMemberAddressDto {
  @IsOptional()
  @IsString()
  consignee?: string;

  @IsOptional()
  @IsString()
  mobile?: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  detail?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
