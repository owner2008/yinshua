import { Body, Controller, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
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
  createWarehouse(@Body() dto: CreateWarehouseDto) {
    return this.inventory.createWarehouse(dto);
  }

  @Put('warehouses/:id')
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
  createMovement(@Body() dto: CreateStockMovementDto) {
    return this.inventory.createMovement(dto);
  }
}
