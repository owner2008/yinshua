import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import {
  CreateStockMovementDto,
  CreateWarehouseDto,
  UpdateWarehouseDto,
} from './dto/inventory.dto';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  findWarehouses() {
    return this.prisma.warehouse.findMany({
      orderBy: { id: 'desc' },
    });
  }

  createWarehouse(dto: CreateWarehouseDto) {
    return this.prisma.warehouse.create({
      data: {
        name: dto.name,
        code: dto.code,
        type: dto.type,
        managerId: dto.managerId ? BigInt(dto.managerId) : undefined,
      },
    });
  }

  async updateWarehouse(id: number, dto: UpdateWarehouseDto) {
    await this.ensureWarehouse(id);
    return this.prisma.warehouse.update({
      where: { id: BigInt(id) },
      data: {
        name: dto.name,
        code: dto.code,
        type: dto.type,
        managerId: dto.managerId ? BigInt(dto.managerId) : undefined,
        status: dto.status,
      },
    });
  }

  findStockItems() {
    return this.prisma.stockItem.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        material: true,
        warehouse: true,
      },
    });
  }

  findMovements() {
    return this.prisma.stockMovement.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        material: true,
        warehouse: true,
      },
      take: 300,
    });
  }

  async createMovement(dto: CreateStockMovementDto) {
    await this.ensureWarehouse(dto.warehouseId);
    await this.ensureMaterial(dto.materialId);

    if (dto.qty <= 0) {
      throw new BadRequestException('库存数量必须大于 0');
    }

    return this.prisma.$transaction(async (tx) => {
      const current = await tx.stockItem.findUnique({
        where: {
          materialId_warehouseId: {
            materialId: BigInt(dto.materialId),
            warehouseId: BigInt(dto.warehouseId),
          },
        },
      });

      const currentQty = current?.qty.toNumber() ?? 0;
      const nextQty = calculateNextQty(dto.movementType, currentQty, dto.qty);
      if (nextQty < 0) {
        throw new BadRequestException('库存不足，不能出库');
      }

      const stockItem = await tx.stockItem.upsert({
        where: {
          materialId_warehouseId: {
            materialId: BigInt(dto.materialId),
            warehouseId: BigInt(dto.warehouseId),
          },
        },
        create: {
          materialId: BigInt(dto.materialId),
          warehouseId: BigInt(dto.warehouseId),
          qty: nextQty,
          availableQty: nextQty,
          reservedQty: 0,
          safetyQty: 0,
        },
        update: {
          qty: nextQty,
          availableQty: nextQty,
        },
      });

      const movement = await tx.stockMovement.create({
        data: {
          movementNo: createMovementNo(),
          movementType: dto.movementType,
          warehouseId: BigInt(dto.warehouseId),
          materialId: BigInt(dto.materialId),
          qty: new Prisma.Decimal(dto.qty),
          unitCost: dto.unitCost == null ? undefined : new Prisma.Decimal(dto.unitCost),
          refType: dto.refType,
          refId: dto.refId ? BigInt(dto.refId) : undefined,
          operatorId: dto.operatorId ? BigInt(dto.operatorId) : undefined,
        },
      });

      return {
        stockItem,
        movement,
      };
    });
  }

  private async ensureWarehouse(id: number) {
    const warehouse = await this.prisma.warehouse.findUnique({ where: { id: BigInt(id) } });
    if (!warehouse) {
      throw new NotFoundException('仓库不存在');
    }
  }

  private async ensureMaterial(id: number) {
    const material = await this.prisma.material.findUnique({ where: { id: BigInt(id) } });
    if (!material) {
      throw new NotFoundException('材料不存在');
    }
  }
}

function calculateNextQty(type: string, currentQty: number, qty: number): number {
  switch (type) {
    case 'in':
      return currentQty + qty;
    case 'out':
      return currentQty - qty;
    case 'adjust':
      return qty;
    default:
      throw new BadRequestException('不支持的库存流水类型');
  }
}

function createMovementNo(): string {
  const now = new Date();
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
    String(now.getSeconds()).padStart(2, '0'),
  ].join('');

  return `SM${stamp}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
}
