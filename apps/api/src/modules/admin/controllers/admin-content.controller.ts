import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { AdminAuthGuard } from '../../auth/admin-auth.guard';
import { RequireAdminPermission } from '../../auth/admin-permission.decorator';
import {
  CreateCategoryEquipmentShowcaseDto,
  CreateHomepageBannerDto,
  UpdateCategoryEquipmentShowcaseDto,
  UpdateHomepageBannerDto,
  UpsertCompanyProfileDto,
  UpsertHomepageBrandingDto,
} from '../dto/admin-content.dto';
import { AdminContentService } from '../services/admin-content.service';

@Controller('admin')
@UseGuards(AdminAuthGuard)
@RequireAdminPermission('admin:content')
export class AdminContentController {
  constructor(private readonly content: AdminContentService) {}

  @Get('company-profile')
  getCompanyProfile() {
    return this.content.getCompanyProfile();
  }

  @Post('company-profile')
  upsertCompanyProfile(@Body() dto: UpsertCompanyProfileDto) {
    return this.content.upsertCompanyProfile(dto);
  }

  @Get('homepage-branding')
  getHomepageBranding() {
    return this.content.getHomepageBranding();
  }

  @Post('homepage-branding')
  upsertHomepageBranding(@Body() dto: UpsertHomepageBrandingDto) {
    return this.content.upsertHomepageBranding(dto);
  }

  @Get('homepage-banners')
  findHomepageBanners() {
    return this.content.findHomepageBanners();
  }

  @Post('homepage-banners')
  createHomepageBanner(@Body() dto: CreateHomepageBannerDto) {
    return this.content.createHomepageBanner(dto);
  }

  @Put('homepage-banners/:id')
  updateHomepageBanner(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateHomepageBannerDto) {
    return this.content.updateHomepageBanner(id, dto);
  }

  @Get('category-equipment-showcases')
  findCategoryEquipmentShowcases() {
    return this.content.findCategoryEquipmentShowcases();
  }

  @Post('category-equipment-showcases')
  createCategoryEquipmentShowcase(@Body() dto: CreateCategoryEquipmentShowcaseDto) {
    return this.content.createCategoryEquipmentShowcase(dto);
  }

  @Put('category-equipment-showcases/:id')
  updateCategoryEquipmentShowcase(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryEquipmentShowcaseDto,
  ) {
    return this.content.updateCategoryEquipmentShowcase(id, dto);
  }
}
