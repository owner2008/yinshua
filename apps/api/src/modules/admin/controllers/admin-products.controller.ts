import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { AdminAuthGuard } from '../../auth/admin-auth.guard';
import { RequireAdminPermission } from '../../auth/admin-permission.decorator';
import {
  CreateProductDto,
  CreateProductTemplateDto,
  UpdateProductDto,
  UpdateProductTemplateDto,
} from '../dto/admin-product.dto';
import { AdminProductsService } from '../services/admin-products.service';

@Controller('admin')
export class AdminProductsController {
  constructor(private readonly products: AdminProductsService) {}

  @Get('products')
  findProducts() {
    return this.products.findProducts();
  }

  @Post('products')
  @UseGuards(AdminAuthGuard)
  @RequireAdminPermission('admin:product')
  createProduct(@Body() dto: CreateProductDto) {
    return this.products.createProduct(dto);
  }

  @Put('products/:id')
  @UseGuards(AdminAuthGuard)
  @RequireAdminPermission('admin:product')
  updateProduct(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    return this.products.updateProduct(id, dto);
  }

  @Get('product-templates')
  findTemplates() {
    return this.products.findTemplates();
  }

  @Post('product-templates')
  @UseGuards(AdminAuthGuard)
  @RequireAdminPermission('admin:product')
  createTemplate(@Body() dto: CreateProductTemplateDto) {
    return this.products.createTemplate(dto);
  }

  @Put('product-templates/:id')
  @UseGuards(AdminAuthGuard)
  @RequireAdminPermission('admin:product')
  updateTemplate(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductTemplateDto) {
    return this.products.updateTemplate(id, dto);
  }
}
