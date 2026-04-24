import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { CurrentMember } from '../auth/current-member.decorator';
import { MemberAuthGuard } from '../auth/member-auth.guard';
import {
  CreateMemberAddressDto,
  RegisterMemberDto,
  UpdateMemberAddressDto,
  UpsertMemberProfileDto,
} from './dto/member.dto';
import { MembersService } from './members.service';

@Controller('member')
@UseGuards(MemberAuthGuard)
export class MemberController {
  constructor(private readonly members: MembersService) {}

  @Get('profile')
  findProfile(@CurrentMember() member: CurrentMember) {
    return this.members.findProfile(member.userId);
  }

  @Post('register')
  register(@Body() dto: RegisterMemberDto, @CurrentMember() member: CurrentMember) {
    return this.members.register(member.userId, dto);
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

  @Put('addresses/:id')
  updateAddress(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMemberAddressDto,
    @CurrentMember() member: CurrentMember,
  ) {
    return this.members.updateAddress(member.userId, id, dto);
  }

  @Put('addresses/:id/default')
  setDefaultAddress(
    @Param('id', ParseIntPipe) id: number,
    @CurrentMember() member: CurrentMember,
  ) {
    return this.members.setDefaultAddress(member.userId, id);
  }

  @Delete('addresses/:id')
  deleteAddress(
    @Param('id', ParseIntPipe) id: number,
    @CurrentMember() member: CurrentMember,
  ) {
    return this.members.deleteAddress(member.userId, id);
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
