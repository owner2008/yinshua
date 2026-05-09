import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import {
  CreatePrintPriceDto,
  CreateProcessDto,
  CreateProcessPriceDto,
  UpdatePrintPriceDto,
  UpdateProcessDto,
  UpdateProcessPriceDto,
} from '../dto/admin-process.dto';
import { AuditLogService } from './audit-log.service';

@Injectable()
export class AdminProcessesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLogService,
  ) {}

  findProcesses() {
    return this.prisma.process.findMany({
      orderBy: { id: 'desc' },
      include: { prices: { orderBy: { effectiveFrom: 'desc' } } },
    });
  }

  async createProcess(dto: CreateProcessDto) {
    const process = await this.prisma.process.create({ data: dto });
    await this.audit.record({
      module: 'process',
      action: 'create',
      targetType: 'process',
      targetId: process.id,
      after: process,
    });
    return process;
  }

  async updateProcess(id: number, dto: UpdateProcessDto) {
    const before = await this.ensureProcess(id);
    const after = await this.prisma.process.update({
      where: { id: BigInt(id) },
      data: dto,
    });
    await this.audit.record({
      module: 'process',
      action: 'update',
      targetType: 'process',
      targetId: after.id,
      before,
      after,
    });
    return after;
  }

  findProcessPrices() {
    return this.prisma.processPrice.findMany({
      orderBy: { effectiveFrom: 'desc' },
      include: { process: true },
    });
  }

  async createProcessPrice(dto: CreateProcessPriceDto) {
    await this.ensureProcess(dto.processId);
    const effectiveFrom = new Date();

    return this.prisma.$transaction(async (tx) => {
      await tx.processPrice.updateMany({
        where: { processId: BigInt(dto.processId), isCurrent: true },
        data: { isCurrent: false, effectiveTo: effectiveFrom },
      });
      const price = await tx.processPrice.create({
        data: {
          processId: BigInt(dto.processId),
          feeMode: dto.feeMode,
          unitPrice: dto.unitPrice,
          minFee: dto.minFee ?? 0,
          setupFee: dto.setupFee ?? 0,
          effectiveFrom,
          isCurrent: true,
        },
      });
      await this.audit.record({
        module: 'process-price',
        action: 'create',
        targetType: 'process_price',
        targetId: price.id,
        after: price,
      });
      return price;
    });
  }

  async updateProcessPrice(id: number, dto: UpdateProcessPriceDto) {
    await this.ensureProcess(dto.processId);
    const before = await this.ensureProcessPrice(id);
    const after = await this.prisma.processPrice.update({
      where: { id: BigInt(id) },
      data: {
        processId: BigInt(dto.processId),
        feeMode: dto.feeMode,
        unitPrice: dto.unitPrice,
        minFee: dto.minFee ?? 0,
        setupFee: dto.setupFee ?? 0,
      },
    });
    await this.audit.record({
      module: 'process-price',
      action: 'update',
      targetType: 'process_price',
      targetId: after.id,
      before,
      after,
    });
    return after;
  }

  findPrintPrices() {
    return this.prisma.printPrice.findMany({
      orderBy: { effectiveFrom: 'desc' },
    });
  }

  async createPrintPrice(dto: CreatePrintPriceDto) {
    const effectiveFrom = new Date();

    return this.prisma.$transaction(async (tx) => {
      await tx.printPrice.updateMany({
        where: { printMode: dto.printMode, isCurrent: true },
        data: { isCurrent: false, effectiveTo: effectiveFrom },
      });
      const price = await tx.printPrice.create({
        data: {
          printMode: dto.printMode,
          feeMode: dto.feeMode,
          unitPrice: dto.unitPrice,
          setupFee: dto.setupFee ?? 0,
          effectiveFrom,
          isCurrent: true,
        },
      });
      await this.audit.record({
        module: 'print-price',
        action: 'create',
        targetType: 'print_price',
        targetId: price.id,
        after: price,
      });
      return price;
    });
  }

  async updatePrintPrice(id: number, dto: UpdatePrintPriceDto) {
    const before = await this.ensurePrintPrice(id);
    const after = await this.prisma.printPrice.update({
      where: { id: BigInt(id) },
      data: {
        printMode: dto.printMode,
        feeMode: dto.feeMode,
        unitPrice: dto.unitPrice,
        setupFee: dto.setupFee ?? 0,
      },
    });
    await this.audit.record({
      module: 'print-price',
      action: 'update',
      targetType: 'print_price',
      targetId: after.id,
      before,
      after,
    });
    return after;
  }

  private async ensureProcess(id: number) {
    const process = await this.prisma.process.findUnique({ where: { id: BigInt(id) } });
    if (!process) {
      throw new NotFoundException('工艺不存在');
    }
    return process;
  }

  private async ensureProcessPrice(id: number) {
    const price = await this.prisma.processPrice.findUnique({ where: { id: BigInt(id) } });
    if (!price) {
      throw new NotFoundException('工艺价格不存在');
    }
    return price;
  }

  private async ensurePrintPrice(id: number) {
    const price = await this.prisma.printPrice.findUnique({ where: { id: BigInt(id) } });
    if (!price) {
      throw new NotFoundException('印刷价格不存在');
    }
    return price;
  }
}
