import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { CatalogService } from './catalog.service';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('home')
  home() {
    return this.catalog.findHome();
  }

  @Get('company-profile')
  companyProfile() {
    return this.catalog.findCompanyProfile();
  }

  @Get('homepage-branding')
  homepageBranding() {
    return this.catalog.findHomepageBranding();
  }

  @Get('homepage-banners')
  homepageBanners() {
    return this.catalog.findHomepageBanners();
  }

  @Get('category-equipment-showcases')
  categoryEquipmentShowcases(@Query('categoryId') categoryId?: string) {
    const parsed = categoryId ? Number(categoryId) : undefined;
    return this.catalog.findCategoryEquipmentShowcases(Number.isFinite(parsed) ? parsed : undefined);
  }

  @Get('categories')
  categories() {
    return this.catalog.findCategories();
  }

  @Get('products')
  products(@Query('categoryId') categoryId?: string) {
    const parsed = categoryId ? Number(categoryId) : undefined;
    return this.catalog.findProducts(Number.isFinite(parsed) ? parsed : undefined);
  }

  @Get('products/:id')
  product(@Param('id', ParseIntPipe) id: number) {
    return this.catalog.findProduct(id);
  }
}
