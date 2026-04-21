import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class UpsertMemberProfileDto {
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
