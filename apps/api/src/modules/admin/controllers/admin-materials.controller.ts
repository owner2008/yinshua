import { Body, Controller, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import {
  CreateMaterialDto,
  CreateMaterialPriceDto,
  UpdateMaterialDto,
} from '../dto/admin-material.dto';
import { AdminMaterialsService } from '../services/admin-materials.service';

@Controller('admin')
export class AdminMaterialsController {
  constructor(private readonly materials: AdminMaterialsService) {}

  @Get('materials')
  findMaterials() {
    return this.materials.findMaterials();
  }

  @Post('materials')
  createMaterial(@Body() dto: CreateMaterialDto) {
    return this.materials.createMaterial(dto);
  }

  @Put('materials/:id')
  updateMaterial(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMaterialDto) {
    return this.materials.updateMaterial(id, dto);
  }

  @Get('material-prices')
  findPrices() {
    return this.materials.findPrices();
  }

  @Post('material-prices')
  createPrice(@Body() dto: CreateMaterialPriceDto) {
    return this.materials.createPrice(dto);
  }
}
