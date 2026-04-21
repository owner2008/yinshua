import { Body, Controller, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import {
  CreatePrintPriceDto,
  CreateProcessDto,
  CreateProcessPriceDto,
  UpdateProcessDto,
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
  createProcess(@Body() dto: CreateProcessDto) {
    return this.processes.createProcess(dto);
  }

  @Put('processes/:id')
  updateProcess(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProcessDto) {
    return this.processes.updateProcess(id, dto);
  }

  @Get('process-prices')
  findProcessPrices() {
    return this.processes.findProcessPrices();
  }

  @Post('process-prices')
  createProcessPrice(@Body() dto: CreateProcessPriceDto) {
    return this.processes.createProcessPrice(dto);
  }

  @Get('print-prices')
  findPrintPrices() {
    return this.processes.findPrintPrices();
  }

  @Post('print-prices')
  createPrintPrice(@Body() dto: CreatePrintPriceDto) {
    return this.processes.createPrintPrice(dto);
  }
}
