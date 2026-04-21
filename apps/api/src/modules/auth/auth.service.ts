import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { BindMobileDto, WxLoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  wxLogin(dto: WxLoginDto) {
    const wxOpenid = `mock_${dto.code}`;
    return this.prisma.user.upsert({
      where: { wxOpenid },
      create: {
        wxOpenid,
        nickname: dto.nickname,
        avatar: dto.avatar,
      },
      update: {
        nickname: dto.nickname,
        avatar: dto.avatar,
      },
    });
  }

  async bindMobile(dto: BindMobileDto) {
    const user = await this.prisma.user.findUnique({ where: { wxOpenid: dto.wxOpenid } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return this.prisma.user.update({
      where: { id: user.id },
      data: { mobile: dto.mobile },
    });
  }
}
