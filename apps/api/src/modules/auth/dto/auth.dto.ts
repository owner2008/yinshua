import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class AdminLoginDto {
  @IsString()
  username!: string;

  @IsString()
  password!: string;
}

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
  @IsNotEmpty()
  @MaxLength(32)
  mobile!: string;
}
