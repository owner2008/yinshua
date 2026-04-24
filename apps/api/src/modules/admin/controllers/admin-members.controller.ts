import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { AdminAuthGuard } from '../../auth/admin-auth.guard';
import { RequireAdminPermission } from '../../auth/admin-permission.decorator';
import {
  CreateAdminMemberDto,
  CreateMemberLevelDto,
  UpdateAdminMemberDto,
  UpdateMemberLevelDto,
} from '../dto/admin-member.dto';
import { AdminMembersService } from '../services/admin-members.service';

@Controller('admin')
@UseGuards(AdminAuthGuard)
@RequireAdminPermission('admin:member')
export class AdminMembersController {
  constructor(private readonly members: AdminMembersService) {}

  @Get('members')
  findMembers() {
    return this.members.findMembers();
  }

  @Get('members/:id')
  findMember(@Param('id', ParseIntPipe) id: number) {
    return this.members.findMember(id);
  }

  @Post('members')
  createMember(@Body() dto: CreateAdminMemberDto) {
    return this.members.createMember(dto);
  }

  @Put('members/:id')
  updateMember(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAdminMemberDto) {
    return this.members.updateMember(id, dto);
  }

  @Get('member-levels')
  findLevels() {
    return this.members.findLevels();
  }

  @Post('member-levels')
  createLevel(@Body() dto: CreateMemberLevelDto) {
    return this.members.createLevel(dto);
  }

  @Put('member-levels/:id')
  updateLevel(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMemberLevelDto) {
    return this.members.updateLevel(id, dto);
  }
}
