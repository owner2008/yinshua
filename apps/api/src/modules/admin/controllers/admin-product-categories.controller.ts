import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { AdminAuthGuard } from '../../auth/admin-auth.guard';
import { RequireAdminPermission } from '../../auth/admin-permission.decorator';
import {
  CreateProductCategoryDto,
  UpdateProductCategoryDto,
} from '../dto/admin-product-category.dto';
import { AdminProductCategoriesService } from '../services/admin-product-categories.service';

@Controller('admin/product-categories')
export class AdminProductCategoriesController {
  constructor(private readonly categories: AdminProductCategoriesService) {}

  @Get()
  findAll() {
    return this.categories.findAll();
  }

  @Post()
  @UseGuards(AdminAuthGuard)
  @RequireAdminPermission('admin:product')
  create(@Body() dto: CreateProductCategoryDto) {
    return this.categories.create(dto);
  }

  @Put(':id')
  @UseGuards(AdminAuthGuard)
  @RequireAdminPermission('admin:product')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductCategoryDto) {
    return this.categories.update(id, dto);
  }
}
