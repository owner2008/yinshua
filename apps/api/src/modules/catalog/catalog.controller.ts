import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { CatalogService } from './catalog.service';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('home')
  home() {
    return this.catalog.findHome();
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
