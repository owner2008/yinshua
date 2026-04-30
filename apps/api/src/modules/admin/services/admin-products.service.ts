import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import {
  CreateProductDto,
  CreateProductTemplateDto,
  UpdateProductDto,
  UpdateProductTemplateDto,
} from '../dto/admin-product.dto';
import { AuditLogService } from './audit-log.service';

@Injectable()
export class AdminProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLogService,
  ) {}

  findProducts() {
    return this.prisma.product.findMany({
      orderBy: [{ sort: 'asc' }, { id: 'desc' }],
      include: { templates: true, category: true },
    });
  }

  async createProduct(dto: CreateProductDto) {
    const product = await this.prisma.product.create({
      data: {
        categoryId: normalizeCategoryId(dto.categoryId),
        name: dto.name,
        code: dto.code,
        coverImage: dto.coverImage,
        galleryJson: dto.gallery ?? undefined,
        description: dto.description,
        applicationScenario: dto.applicationScenario,
        status: dto.status,
        sort: dto.sort,
        isHot: dto.isHot,
      },
    });
    await this.audit.record({
      module: 'product',
      action: 'create',
      targetType: 'product',
      targetId: product.id,
      after: product,
    });
    return product;
  }

  async updateProduct(id: number, dto: UpdateProductDto) {
    const before = await this.ensureProduct(id);
    const after = await this.prisma.product.update({
      where: { id: BigInt(id) },
      data: {
        categoryId: dto.categoryId === undefined ? undefined : normalizeCategoryId(dto.categoryId),
        name: dto.name,
        code: dto.code,
        coverImage: dto.coverImage,
        galleryJson: dto.gallery ?? undefined,
        description: dto.description,
        applicationScenario: dto.applicationScenario,
        status: dto.status,
        sort: dto.sort,
        isHot: dto.isHot,
      },
    });
    await this.audit.record({
      module: 'product',
      action: 'update',
      targetType: 'product',
      targetId: after.id,
      before,
      after,
    });
    return after;
  }

  findTemplates() {
    return this.prisma.productTemplate.findMany({
      orderBy: { id: 'desc' },
      include: { product: true, options: true },
    });
  }

  async createTemplate(dto: CreateProductTemplateDto) {
    const template = await this.prisma.productTemplate.create({
      data: this.createTemplateData(dto),
    });
    await this.replaceTemplateOptions(Number(template.id), dto);
    const after = await this.findTemplate(Number(template.id));
    await this.audit.record({
      module: 'product-template',
      action: 'create',
      targetType: 'product_template',
      targetId: template.id,
      after,
    });
    return after;
  }

  async updateTemplate(id: number, dto: UpdateProductTemplateDto) {
    const before = await this.findTemplate(id);
    await this.prisma.productTemplate.update({
      where: { id: BigInt(id) },
      data: this.updateTemplateData(dto),
    });
    await this.replaceTemplateOptions(id, dto);
    const after = await this.findTemplate(id);
    await this.audit.record({
      module: 'product-template',
      action: 'update',
      targetType: 'product_template',
      targetId: after.id,
      before,
      after,
    });
    return after;
  }

  async findTemplate(id: number) {
    const template = await this.prisma.productTemplate.findUnique({
      where: { id: BigInt(id) },
      include: { product: true, options: true },
    });
    if (!template) {
      throw new NotFoundException('报价模板不存在');
    }
    return template;
  }

  private async ensureProduct(id: number) {
    const product = await this.prisma.product.findUnique({ where: { id: BigInt(id) } });
    if (!product) {
      throw new NotFoundException('产品不存在');
    }
    return product;
  }

  private async ensureTemplate(id: number) {
    const template = await this.prisma.productTemplate.findUnique({ where: { id: BigInt(id) } });
    if (!template) {
      throw new NotFoundException('报价模板不存在');
    }
  }

  private createTemplateData(dto: CreateProductTemplateDto): Prisma.ProductTemplateUncheckedCreateInput {
    return {
      productId: BigInt(dto.productId),
      templateName: dto.templateName,
      widthMin: dto.widthMin,
      widthMax: dto.widthMax,
      heightMin: dto.heightMin,
      heightMax: dto.heightMax,
      quantityMin: dto.quantityMin,
      quantityMax: dto.quantityMax,
      allowCustomShape: dto.allowCustomShape,
      allowLamination: dto.allowLamination,
      allowHotStamping: dto.allowHotStamping,
      allowUv: dto.allowUv,
      allowDieCut: dto.allowDieCut,
      allowProofing: dto.allowProofing,
      defaultLossRate: dto.defaultLossRate,
      minPrice: dto.minPrice,
      status: dto.status,
    };
  }

  private updateTemplateData(dto: Partial<CreateProductTemplateDto>): Prisma.ProductTemplateUncheckedUpdateInput {
    return {
      productId: dto.productId ? BigInt(dto.productId) : undefined,
      templateName: dto.templateName,
      widthMin: dto.widthMin,
      widthMax: dto.widthMax,
      heightMin: dto.heightMin,
      heightMax: dto.heightMax,
      quantityMin: dto.quantityMin,
      quantityMax: dto.quantityMax,
      allowCustomShape: dto.allowCustomShape,
      allowLamination: dto.allowLamination,
      allowHotStamping: dto.allowHotStamping,
      allowUv: dto.allowUv,
      allowDieCut: dto.allowDieCut,
      allowProofing: dto.allowProofing,
      defaultLossRate: dto.defaultLossRate,
      minPrice: dto.minPrice,
      status: dto.status,
    };
  }

  private async replaceTemplateOptions(id: number, dto: Partial<CreateProductTemplateDto>) {
    const hasOptionUpdate =
      dto.materialIds !== undefined ||
      dto.processCodes !== undefined ||
      dto.printModes !== undefined ||
      dto.shapeTypes !== undefined;

    if (!hasOptionUpdate) {
      return;
    }

    const optionRows = [
      ...(dto.materialIds ?? []).map((value) => ['material', String(value), String(value)]),
      ...(dto.processCodes ?? []).map((value) => ['process', value, value]),
      ...(dto.printModes ?? []).map((value) => ['print_mode', value, value]),
      ...(dto.shapeTypes ?? []).map((value) => ['shape', value, value]),
    ] as Array<[string, string, string]>;

    if (optionRows.length === 0) {
      await this.prisma.productTemplateOption.deleteMany({ where: { templateId: BigInt(id) } });
      return;
    }

    await this.prisma.$transaction([
      this.prisma.productTemplateOption.deleteMany({ where: { templateId: BigInt(id) } }),
      this.prisma.productTemplateOption.createMany({
        data: optionRows.map(([optionType, optionValue, optionLabel], index) => ({
          templateId: BigInt(id),
          optionType,
          optionValue,
          optionLabel,
          sort: index + 1,
        })),
      }),
    ]);
  }
}

function normalizeCategoryId(categoryId: number | null | undefined): bigint | null | undefined {
  if (categoryId === null) {
    return null;
  }
  if (categoryId === undefined) {
    return undefined;
  }
  return BigInt(categoryId);
}
