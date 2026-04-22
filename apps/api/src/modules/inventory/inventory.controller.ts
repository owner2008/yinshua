import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { AdminAuthGuard } from '../auth/admin-auth.guard';
import { RequireAdminPermission } from '../auth/admin-permission.decorator';
import {
  CreateStockMovementDto,
  CreateWarehouseDto,
  UpdateWarehouseDto,
} from './dto/inventory.dto';
import { InventoryService } from './inventory.service';

@Controller('admin')
export class InventoryController {
  constructor(private readonly inventory: InventoryService) {}

  @Get('warehouses')
  findWarehouses() {
    return this.inventory.findWarehouses();
  }

  @Post('warehouses')
  @UseGuards(AdminAuthGuard)
  @RequireAdminPermission('admin:inventory')
  createWarehouse(@Body() dto: CreateWarehouseDto) {
    return this.inventory.createWarehouse(dto);
  }

  @Put('warehouses/:id')
  @UseGuards(AdminAuthGuard)
  @RequireAdminPermission('admin:inventory')
  updateWarehouse(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateWarehouseDto) {
    return this.inventory.updateWarehouse(id, dto);
  }

  @Get('stock-items')
  findStockItems() {
    return this.inventory.findStockItems();
  }

  @Get('stock-movements')
  findMovements() {
    return this.inventory.findMovements();
  }

  @Post('stock-movements')
  @UseGuards(AdminAuthGuard)
  @RequireAdminPermission('admin:inventory')
  createMovement(@Body() dto: CreateStockMovementDto) {
    return this.inventory.createMovement(dto);
  }
}
