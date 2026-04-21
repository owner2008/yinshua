import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { CreateMemberAddressDto, UpsertMemberProfileDto } from './dto/member.dto';
import { MembersService } from './members.service';

@Controller('member')
export class MemberController {
  constructor(private readonly members: MembersService) {}

  @Get('profile')
  findProfile(@Query('userId', ParseIntPipe) userId: number) {
    return this.members.findProfile(userId);
  }

  @Put('profile')
  upsertProfile(@Body() dto: UpsertMemberProfileDto) {
    return this.members.upsertProfile(dto);
  }

  @Get('addresses')
  findAddresses(@Query('userId', ParseIntPipe) userId: number) {
    return this.members.findAddresses(userId);
  }

  @Post('addresses')
  createAddress(@Body() dto: CreateMemberAddressDto) {
    return this.members.createAddress(dto);
  }

  @Get('quotes')
  findQuotes(@Query('userId', ParseIntPipe) userId: number) {
    return this.members.findQuotes(userId);
  }

  @Get('quotes/:quoteNo')
  findQuote(@Query('userId', ParseIntPipe) userId: number, @Param('quoteNo') quoteNo: string) {
    return this.members.findQuote(userId, quoteNo);
  }
}
