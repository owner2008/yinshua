import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AdminLoginDto, BindMobileDto, WxLoginDto } from './dto/auth.dto';
import { CurrentMember } from './current-member.decorator';
import { MemberAuthGuard } from './member-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('admin-login')
  adminLogin(@Body() dto: AdminLoginDto) {
    return this.auth.adminLogin(dto);
  }

  @Post('wx-login')
  wxLogin(@Body() dto: WxLoginDto) {
    return this.auth.wxLogin(dto);
  }

  @Post('bind-mobile')
  @UseGuards(MemberAuthGuard)
  bindMobile(@Body() dto: BindMobileDto, @CurrentMember() member: CurrentMember) {
    return this.auth.bindMobile(member.userId, dto);
  }
}
