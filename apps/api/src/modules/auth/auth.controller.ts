import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { BindMobileDto, WxLoginDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('wx-login')
  wxLogin(@Body() dto: WxLoginDto) {
    return this.auth.wxLogin(dto);
  }

  @Post('bind-mobile')
  bindMobile(@Body() dto: BindMobileDto) {
    return this.auth.bindMobile(dto);
  }
}
