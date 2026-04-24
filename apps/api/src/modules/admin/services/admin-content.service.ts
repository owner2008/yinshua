import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import {
  CreateCategoryEquipmentShowcaseDto,
  CreateHomepageBannerDto,
  UpdateCategoryEquipmentShowcaseDto,
  UpdateHomepageBannerDto,
  UpsertCompanyProfileDto,
  UpsertHomepageBrandingDto,
} from '../dto/admin-content.dto';
import { AuditLogService } from './audit-log.service';

@Injectable()
export class AdminContentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLogService,
  ) {}

  getCompanyProfile() {
    return this.prisma.companyProfile.findFirst({
      orderBy: [{ sort: 'asc' }, { id: 'asc' }],
    });
  }

  async upsertCompanyProfile(dto: UpsertCompanyProfileDto) {
    const before = await this.getCompanyProfile();
    const targetId = before?.id ?? 1n;
    const after = await this.prisma.companyProfile.upsert({
      where: { id: targetId },
      update: {
        title: dto.title,
        subtitle: dto.subtitle,
        coverImage: dto.coverImage,
        galleryJson: dto.gallery ?? undefined,
        content: dto.content,
        contactPhone: dto.contactPhone,
        contactWechat: dto.contactWechat,
        address: dto.address,
        sort: dto.sort ?? 0,
        status: dto.status ?? 'active',
      },
      create: {
        id: targetId,
        title: dto.title,
        subtitle: dto.subtitle,
        coverImage: dto.coverImage,
        galleryJson: dto.gallery ?? undefined,
        content: dto.content,
        contactPhone: dto.contactPhone,
        contactWechat: dto.contactWechat,
        address: dto.address,
        sort: dto.sort ?? 0,
        status: dto.status ?? 'active',
      },
    });
    await this.audit.record({
      module: 'content',
      action: before ? 'update' : 'create',
      targetType: 'company_profile',
      targetId: after.id,
      before,
      after,
    });
    return after;
  }

  getHomepageBranding() {
    return this.prisma.homepageBranding.findFirst({
      orderBy: { id: 'asc' },
    });
  }

  async upsertHomepageBranding(dto: UpsertHomepageBrandingDto) {
    const before = await this.getHomepageBranding();
    const targetId = before?.id ?? 1n;
    const after = await this.prisma.homepageBranding.upsert({
      where: { id: targetId },
      update: {
        siteName: dto.siteName,
        siteSubtitle: dto.siteSubtitle,
        logoImage: dto.logoImage,
        headerNotice: dto.headerNotice,
        status: dto.status ?? 'active',
      },
      create: {
        id: targetId,
        siteName: dto.siteName,
        siteSubtitle: dto.siteSubtitle,
        logoImage: dto.logoImage,
        headerNotice: dto.headerNotice,
        status: dto.status ?? 'active',
      },
    });
    await this.audit.record({
      module: 'content',
      action: before ? 'update' : 'create',
      targetType: 'homepage_branding',
      targetId: after.id,
      before,
      after,
    });
    return after;
  }

  findHomepageBanners() {
    return this.prisma.homepageBanner.findMany({
      orderBy: [{ sort: 'asc' }, { id: 'asc' }],
    });
  }

  async createHomepageBanner(dto: CreateHomepageBannerDto) {
    const after = await this.prisma.homepageBanner.create({
      data: toCreateHomepageBannerData(dto),
    });
    await this.audit.record({
      module: 'content',
      action: 'create',
      targetType: 'homepage_banner',
      targetId: after.id,
      after,
    });
    return after;
  }

  async updateHomepageBanner(id: number, dto: UpdateHomepageBannerDto) {
    const before = await this.ensureHomepageBanner(id);
    const after = await this.prisma.homepageBanner.update({
      where: { id: BigInt(id) },
      data: toUpdateHomepageBannerData(dto),
    });
    await this.audit.record({
      module: 'content',
      action: 'update',
      targetType: 'homepage_banner',
      targetId: after.id,
      before,
      after,
    });
    return after;
  }

  findCategoryEquipmentShowcases() {
    return this.prisma.categoryEquipmentShowcase.findMany({
      orderBy: [{ sort: 'asc' }, { id: 'asc' }],
      include: { category: true },
    }).then((rows) => rows.map(normalizeEquipmentShowcase));
  }

  async createCategoryEquipmentShowcase(dto: CreateCategoryEquipmentShowcaseDto) {
    await this.ensureCategory(dto.categoryId);
    const created = await this.prisma.categoryEquipmentShowcase.create({
      data: toCreateEquipmentShowcaseData(dto),
      include: { category: true },
    });
    const after = normalizeEquipmentShowcase(created);
    await this.audit.record({
      module: 'content',
      action: 'create',
      targetType: 'category_equipment_showcase',
      targetId: created.id,
      after,
    });
    return after;
  }

  async updateCategoryEquipmentShowcase(id: number, dto: UpdateCategoryEquipmentShowcaseDto) {
    const before = await this.ensureCategoryEquipmentShowcase(id);
    if (dto.categoryId) {
      await this.ensureCategory(dto.categoryId);
    }
    const updated = await this.prisma.categoryEquipmentShowcase.update({
      where: { id: BigInt(id) },
      data: toUpdateEquipmentShowcaseData(dto),
      include: { category: true },
    });
    const after = normalizeEquipmentShowcase(updated);
    await this.audit.record({
      module: 'content',
      action: 'update',
      targetType: 'category_equipment_showcase',
      targetId: updated.id,
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

  private async ensureHomepageBanner(id: number) {
    const banner = await this.prisma.homepageBanner.findUnique({
      where: { id: BigInt(id) },
    });
    if (!banner) {
      throw new NotFoundException('首页 Banner 不存在');
    }
    return banner;
  }

  private async ensureCategoryEquipmentShowcase(id: number) {
    const showcase = await this.prisma.categoryEquipmentShowcase.findUnique({
      where: { id: BigInt(id) },
      include: { category: true },
    });
    if (!showcase) {
      throw new NotFoundException('分类设备展示不存在');
    }
    return normalizeEquipmentShowcase(showcase);
  }
}

function toCreateHomepageBannerData(dto: CreateHomepageBannerDto): Prisma.HomepageBannerUncheckedCreateInput {
  return {
    title: dto.title,
    subtitle: dto.subtitle,
    imageUrl: dto.imageUrl,
    mobileImageUrl: dto.mobileImageUrl,
    linkType: dto.linkType ?? 'none',
    linkValue: dto.linkValue,
    buttonText: dto.buttonText,
    sort: dto.sort ?? 0,
    status: dto.status ?? 'active',
    startAt: parseDateInput(dto.startAt),
    endAt: parseDateInput(dto.endAt),
  };
}

function toUpdateHomepageBannerData(dto: UpdateHomepageBannerDto): Prisma.HomepageBannerUncheckedUpdateInput {
  return {
    title: dto.title,
    subtitle: dto.subtitle,
    imageUrl: dto.imageUrl,
    mobileImageUrl: dto.mobileImageUrl,
    linkType: dto.linkType,
    linkValue: dto.linkValue,
    buttonText: dto.buttonText,
    sort: dto.sort,
    status: dto.status,
    startAt: parseDateInput(dto.startAt),
    endAt: parseDateInput(dto.endAt),
  };
}

function toCreateEquipmentShowcaseData(
  dto: CreateCategoryEquipmentShowcaseDto,
): Prisma.CategoryEquipmentShowcaseUncheckedCreateInput {
  return {
    categoryId: BigInt(dto.categoryId),
    name: dto.name,
    title: dto.title,
    description: dto.description,
    imageUrl: dto.imageUrl,
    galleryJson: dto.gallery ?? undefined,
    specsJson: toJsonValue(dto.specs),
    sort: dto.sort ?? 0,
    status: dto.status ?? 'active',
  };
}

function toUpdateEquipmentShowcaseData(
  dto: UpdateCategoryEquipmentShowcaseDto,
): Prisma.CategoryEquipmentShowcaseUncheckedUpdateInput {
  return {
    categoryId: dto.categoryId ? BigInt(dto.categoryId) : undefined,
    name: dto.name,
    title: dto.title,
    description: dto.description,
    imageUrl: dto.imageUrl,
    galleryJson: dto.gallery ?? undefined,
    specsJson: toJsonValue(dto.specs),
    sort: dto.sort,
    status: dto.status,
  };
}

function normalizeEquipmentShowcase<T extends { galleryJson: unknown; specsJson: unknown }>(row: T) {
  return {
    ...row,
    galleryJson: Array.isArray(row.galleryJson)
      ? row.galleryJson.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      : [],
    specsJson:
      row.specsJson && typeof row.specsJson === 'object' && !Array.isArray(row.specsJson)
        ? row.specsJson
        : {},
  };
}

function parseDateInput(value?: string | null) {
  if (!value) {
    return undefined;
  }
  return new Date(value);
}

function toJsonValue(value?: Record<string, unknown>) {
  if (!value) {
    return undefined;
  }
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}
