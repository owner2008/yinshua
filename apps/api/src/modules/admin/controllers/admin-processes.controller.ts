import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { AdminAuthGuard } from '../../auth/admin-auth.guard';
import { RequireAdminPermission } from '../../auth/admin-permission.decorator';
import {
  CreatePrintPriceDto,
  CreateProcessDto,
  CreateProcessPriceDto,
  UpdatePrintPriceDto,
  UpdateProcessDto,
  UpdateProcessPriceDto,
} from '../dto/admin-process.dto';
import { AdminProcessesService } from '../services/admin-processes.service';

@Controller('admin')
export class AdminProcessesController {
  constructor(private readonly processes: AdminProcessesService) {}

  @Get('processes')
  findProcesses() {
    return this.processes.findProcesses();
  }

  @Post('processes')
  @UseGuards(AdminAuthGuard)
  @RequireAdminPermission('admin:pricing')
  createProcess(@Body() dto: CreateProcessDto) {
    return this.processes.createProcess(dto);
  }

  @Put('processes/:id')
  @UseGuards(AdminAuthGuard)
  @RequireAdminPermission('admin:pricing')
  updateProcess(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProcessDto) {
    return this.processes.updateProcess(id, dto);
  }

  @Get('process-prices')
  findProcessPrices() {
    return this.processes.findProcessPrices();
  }

  @Post('process-prices')
  @UseGuards(AdminAuthGuard)
  @RequireAdminPermission('admin:pricing')
  createProcessPrice(@Body() dto: CreateProcessPriceDto) {
    return this.processes.createProcessPrice(dto);
  }

  @Put('process-prices/:id')
  @UseGuards(AdminAuthGuard)
  @RequireAdminPermission('admin:pricing')
  updateProcessPrice(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProcessPriceDto) {
    return this.processes.updateProcessPrice(id, dto);
  }

  @Get('print-prices')
  findPrintPrices() {
    return this.processes.findPrintPrices();
  }

  @Post('print-prices')
  @UseGuards(AdminAuthGuard)
  @RequireAdminPermission('admin:pricing')
  createPrintPrice(@Body() dto: CreatePrintPriceDto) {
    return this.processes.createPrintPrice(dto);
  }

  @Put('print-prices/:id')
  @UseGuards(AdminAuthGuard)
  @RequireAdminPermission('admin:pricing')
  updatePrintPrice(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePrintPriceDto) {
    return this.processes.updatePrintPrice(id, dto);
  }
}
