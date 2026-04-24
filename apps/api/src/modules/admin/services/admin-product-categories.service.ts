import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import {
  CreateProductCategoryDto,
  UpdateProductCategoryDto,
} from '../dto/admin-product-category.dto';
import { AuditLogService } from './audit-log.service';

@Injectable()
export class AdminProductCategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLogService,
  ) {}

  findAll() {
    return this.prisma.productCategory.findMany({
      orderBy: [{ sort: 'asc' }, { id: 'asc' }],
    });
  }

  async create(dto: CreateProductCategoryDto) {
    if (dto.parentId) {
      await this.ensureCategory(dto.parentId);
    }
    const created = await this.prisma.productCategory.create({
      data: {
        name: dto.name,
        parentId: dto.parentId ? BigInt(dto.parentId) : null,
        sort: dto.sort ?? 0,
      },
    });
    await this.audit.record({
      module: 'product-category',
      action: 'create',
      targetType: 'product_category',
      targetId: created.id,
      after: created,
    });
    return created;
  }

  async update(id: number, dto: UpdateProductCategoryDto) {
    const before = await this.ensureCategory(id);
    if (dto.parentId) {
      if (dto.parentId === id) {
        throw new BadRequestException('分类不能以自身为上级');
      }
      await this.ensureCategory(dto.parentId);
    }
    const after = await this.prisma.productCategory.update({
      where: { id: BigInt(id) },
      data: {
        name: dto.name,
        parentId:
          dto.parentId === null ? null : dto.parentId ? BigInt(dto.parentId) : undefined,
        sort: dto.sort,
        status: dto.status,
      },
    });
    await this.audit.record({
      module: 'product-category',
      action: 'update',
      targetType: 'product_category',
      targetId: after.id,
      before,
      after,
    });
    return after;
  }

  private async ensureCategory(id: number) {
    const category = await this.prisma.productCategory.findUnique({
      where: { id: BigInt(id) },
    });
    if (!category) {
      throw new NotFoundException('产品分类不存在');
    }
    return category;
  }
}
