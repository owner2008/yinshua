import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import {
  CreateMaterialDto,
  CreateMaterialPriceDto,
  UpdateMaterialDto,
} from '../dto/admin-material.dto';
import { AuditLogService } from './audit-log.service';

@Injectable()
export class AdminMaterialsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLogService,
  ) {}

  findMaterials() {
    return this.prisma.material.findMany({
      orderBy: { id: 'desc' },
      include: { prices: { orderBy: { effectiveFrom: 'desc' } } },
    });
  }

  async createMaterial(dto: CreateMaterialDto) {
    const material = await this.prisma.material.create({ data: dto });
    await this.audit.record({
      module: 'material',
      action: 'create',
      targetType: 'material',
      targetId: material.id,
      after: material,
    });
    return material;
  }

  async updateMaterial(id: number, dto: UpdateMaterialDto) {
    const before = await this.ensureMaterial(id);
    const after = await this.prisma.material.update({
      where: { id: BigInt(id) },
      data: dto,
    });
    await this.audit.record({
      module: 'material',
      action: 'update',
      targetType: 'material',
      targetId: after.id,
      before,
      after,
    });
    return after;
  }

  findPrices() {
    return this.prisma.materialPrice.findMany({
      orderBy: { effectiveFrom: 'desc' },
      include: { material: true },
    });
  }

  async createPrice(dto: CreateMaterialPriceDto) {
    await this.ensureMaterial(dto.materialId);
    const effectiveFrom = new Date();

    return this.prisma.$transaction(async (tx) => {
      await tx.materialPrice.updateMany({
        where: { materialId: BigInt(dto.materialId), isCurrent: true },
        data: { isCurrent: false, effectiveTo: effectiveFrom },
      });
      const price = await tx.materialPrice.create({
        data: {
          materialId: BigInt(dto.materialId),
          priceType: dto.priceType ?? 'calc',
          unitPrice: dto.unitPrice,
          currency: dto.currency ?? 'CNY',
          effectiveFrom,
          isCurrent: dto.isCurrent ?? true,
        },
      });
      await this.audit.record({
        module: 'material-price',
        action: 'create',
        targetType: 'material_price',
        targetId: price.id,
        after: price,
      });
      return price;
    });
  }

  private async ensureMaterial(id: number) {
    const material = await this.prisma.material.findUnique({ where: { id: BigInt(id) } });
    if (!material) {
      throw new NotFoundException('材料不存在');
    }
    return material;
  }
}
