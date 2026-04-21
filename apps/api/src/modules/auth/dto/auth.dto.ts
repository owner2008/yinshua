import { IsOptional, IsString } from 'class-validator';

export class WxLoginDto {
  @IsString()
  code!: string;

  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}

export class BindMobileDto {
  @IsString()
  wxOpenid!: string;

  @IsString()
  mobile!: string;
}
