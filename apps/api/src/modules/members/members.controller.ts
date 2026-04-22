import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CurrentMember } from '../auth/current-member.decorator';
import { MemberAuthGuard } from '../auth/member-auth.guard';
import { CreateMemberAddressDto, UpsertMemberProfileDto } from './dto/member.dto';
import { MembersService } from './members.service';

@Controller('member')
@UseGuards(MemberAuthGuard)
export class MemberController {
  constructor(private readonly members: MembersService) {}

  @Get('profile')
  findProfile(@CurrentMember() member: CurrentMember) {
    return this.members.findProfile(member.userId);
  }

  @Put('profile')
  upsertProfile(@Body() dto: UpsertMemberProfileDto, @CurrentMember() member: CurrentMember) {
    return this.members.upsertProfile({ ...dto, userId: member.userId });
  }

  @Get('addresses')
  findAddresses(@CurrentMember() member: CurrentMember) {
    return this.members.findAddresses(member.userId);
  }

  @Post('addresses')
  createAddress(@Body() dto: CreateMemberAddressDto, @CurrentMember() member: CurrentMember) {
    return this.members.createAddress({ ...dto, userId: member.userId });
  }

  @Get('quotes')
  findQuotes(@CurrentMember() member: CurrentMember) {
    return this.members.findQuotes(member.userId);
  }

  @Get('quotes/:quoteNo')
  findQuote(@CurrentMember() member: CurrentMember, @Param('quoteNo') quoteNo: string) {
    return this.members.findQuote(member.userId, quoteNo);
  }
}
