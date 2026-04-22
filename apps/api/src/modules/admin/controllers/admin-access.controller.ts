import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { AdminAuthGuard } from '../../auth/admin-auth.guard';
import { RequireAdminPermission } from '../../auth/admin-permission.decorator';
import {
  CreateAdminRoleDto,
  CreateAdminUserDto,
  UpdateAdminRoleDto,
  UpdateAdminUserDto,
} from '../dto/admin-access.dto';
import { AdminAccessService } from '../services/admin-access.service';

@Controller('admin')
@UseGuards(AdminAuthGuard)
@RequireAdminPermission('admin:permission')
export class AdminAccessController {
  constructor(private readonly access: AdminAccessService) {}

  @Get('admin-users')
  findUsers() {
    return this.access.findUsers();
  }

  @Post('admin-users')
  createUser(@Body() dto: CreateAdminUserDto) {
    return this.access.createUser(dto);
  }

  @Put('admin-users/:id')
  updateUser(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAdminUserDto) {
    return this.access.updateUser(id, dto);
  }

  @Get('admin-roles')
  findRoles() {
    return this.access.findRoles();
  }

  @Post('admin-roles')
  createRole(@Body() dto: CreateAdminRoleDto) {
    return this.access.createRole(dto);
  }

  @Put('admin-roles/:id')
  updateRole(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAdminRoleDto) {
    return this.access.updateRole(id, dto);
  }

  @Get('admin-permissions')
  findPermissions() {
    return this.access.findPermissions();
  }
}
