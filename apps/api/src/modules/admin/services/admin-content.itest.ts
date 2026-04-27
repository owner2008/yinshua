import '../../../load-env';
import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { BadRequestException, UnsupportedMediaTypeException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { PrismaService } from '../../../database/prisma.service';
import { CatalogService } from '../../catalog/catalog.service';
import { AdminContentAssetsController } from '../controllers/admin-content-assets.controller';
import { AuditLogService } from './audit-log.service';
import { AdminContentService } from './admin-content.service';

const testPrefix = 'IT 内容管理';
let prisma: PrismaService;
let content: AdminContentService;
let catalog: CatalogService;
let previousCompanyProfile: Awaited<ReturnType<PrismaService['companyProfile']['findFirst']>>;
let previousBranding: Awaited<ReturnType<PrismaService['homepageBranding']['findFirst']>>;

describe('content management integration', () => {
  before(async () => {
    assert.ok(process.env.DATABASE_URL, 'DATABASE_URL is required for integration tests');
    prisma = new PrismaService();
    await prisma.$connect();
    content = new AdminContentService(prisma, new AuditLogService(prisma));
    catalog = new CatalogService(prisma);
    previousCompanyProfile = await prisma.companyProfile.findFirst({ orderBy: [{ sort: 'asc' }, { id: 'asc' }] });
    previousBranding = await prisma.homepageBranding.findFirst({ orderBy: { id: 'asc' } });
    await cleanup();
  });

  after(async () => {
    await cleanup();
    await restoreSingletonContent();
    await prisma.$disconnect();
  });

  it('saves content records and exposes only active/current content to catalog', async () => {
    const category = await prisma.productCategory.create({
      data: {
        name: `${testPrefix} 分类`,
        sort: 901,
        status: 'active',
      },
    });

    const profile = await content.upsertCompanyProfile({
      title: `${testPrefix} 企业介绍`,
      subtitle: '面向验收的企业介绍',
      coverImage: '/uploads/content/company.jpg',
      gallery: ['/uploads/content/a.jpg', '', '/uploads/content/b.jpg'],
      content: '内容管理集成测试企业介绍正文。',
      contactPhone: '400-000-0000',
      contactWechat: 'it-content',
      address: '测试地址',
      sort: 0,
      status: 'active',
    });
    assert.equal(profile.title, `${testPrefix} 企业介绍`);

    const branding = await content.upsertHomepageBranding({
      siteName: `${testPrefix} 首页`,
      siteSubtitle: '测试首页头部',
      logoImage: '/uploads/content/logo.png',
      headerNotice: '内容管理验收中',
      themeMode: 'forest',
      status: 'active',
    });
    assert.equal(branding.themeMode, 'forest');

    const activeBanner = await content.createHomepageBanner({
      title: `${testPrefix} 有效 Banner`,
      imageUrl: '/uploads/content/banner.jpg',
      linkType: 'category',
      linkValue: String(category.id),
      buttonText: '查看分类',
      sort: 1,
      status: 'active',
      startAt: '2026-01-01T00:00:00.000Z',
      endAt: '2026-12-31T00:00:00.000Z',
    });
    await content.createHomepageBanner({
      title: `${testPrefix} 过期 Banner`,
      imageUrl: '/uploads/content/expired.jpg',
      sort: 2,
      status: 'active',
      endAt: '2026-01-01T00:00:00.000Z',
    });

    const showcase = await content.createCategoryEquipmentShowcase({
      categoryId: Number(category.id),
      name: `${testPrefix} 设备`,
      title: '数码印刷设备',
      imageUrl: '/uploads/content/equipment.jpg',
      gallery: ['/uploads/content/equipment-1.jpg'],
      specs: { speed: '120m/min', color: 'CMYK' },
      sort: 1,
      status: 'active',
    });
    assert.equal(showcase.category?.name, `${testPrefix} 分类`);

    const home = await catalog.findHome();
    assert.equal(home.companyProfile?.title, `${testPrefix} 企业介绍`);
    assert.equal(home.branding?.siteName, `${testPrefix} 首页`);
    assert.ok(home.banners.some((banner) => banner.id === activeBanner.id));
    assert.ok(!home.banners.some((banner) => banner.title === `${testPrefix} 过期 Banner`));
    assert.ok(home.categoryEquipmentShowcases.some((item) => item.name === `${testPrefix} 设备`));

    const logs = await prisma.operationLog.findMany({
      where: {
        module: 'content',
        targetType: {
          in: ['company_profile', 'homepage_branding', 'homepage_banner', 'category_equipment_showcase'],
        },
      },
    });
    assert.ok(logs.some((log) => log.targetId === profile.id));
    assert.ok(logs.some((log) => log.targetId === activeBanner.id));
    assert.ok(logs.some((log) => log.targetId === showcase.id));
  });

  it('rejects invalid banner date ranges and missing link values', async () => {
    await assert.rejects(
      () =>
        content.createHomepageBanner({
          title: `${testPrefix} 无跳转值`,
          imageUrl: '/uploads/content/banner.jpg',
          linkType: 'product',
        }),
      (error) => error instanceof BadRequestException,
    );

    await assert.rejects(
      () =>
        content.createHomepageBanner({
          title: `${testPrefix} 错误时间`,
          imageUrl: '/uploads/content/banner.jpg',
          startAt: '2026-05-01T00:00:00.000Z',
          endAt: '2026-04-01T00:00:00.000Z',
        }),
      (error) => error instanceof BadRequestException,
    );
  });

  it('stores supported content images and rejects unsupported upload MIME types', async () => {
    const controller = new AdminContentAssetsController();
    const uploaded = await controller.upload({
      fileName: 'content-test.png',
      mimeType: 'image/png',
      contentBase64: Buffer.from('tiny-image').toString('base64'),
    });
    assert.match(uploaded.url, /^\/uploads\/content\/.+\.png$/);

    const filePath = join(process.cwd(), uploaded.url.replace(/^\//, ''));
    await unlink(filePath);

    await assert.rejects(
      () =>
        controller.upload({
          fileName: 'content-test.txt',
          mimeType: 'text/plain',
          contentBase64: Buffer.from('not-image').toString('base64'),
        }),
      (error) => error instanceof UnsupportedMediaTypeException,
    );
  });
});

async function cleanup() {
  const banners = await prisma.homepageBanner.findMany({
    where: { title: { startsWith: testPrefix } },
    select: { id: true },
  });
  const showcases = await prisma.categoryEquipmentShowcase.findMany({
    where: { name: { startsWith: testPrefix } },
    select: { id: true },
  });
  const categories = await prisma.productCategory.findMany({
    where: { name: { startsWith: testPrefix } },
    select: { id: true },
  });
  const targetIds = [...banners, ...showcases].map((item) => item.id);

  await prisma.operationLog.deleteMany({
    where: {
      module: 'content',
      OR: [
        { targetType: { in: ['homepage_banner', 'category_equipment_showcase'] }, targetId: { in: targetIds } },
        { targetType: { in: ['company_profile', 'homepage_branding'] } },
      ],
    },
  });
  await prisma.categoryEquipmentShowcase.deleteMany({ where: { id: { in: showcases.map((item) => item.id) } } });
  await prisma.homepageBanner.deleteMany({ where: { id: { in: banners.map((item) => item.id) } } });
  await prisma.productCategory.deleteMany({ where: { id: { in: categories.map((item) => item.id) } } });
}

async function restoreSingletonContent() {
  const currentProfile = await prisma.companyProfile.findFirst({ orderBy: [{ sort: 'asc' }, { id: 'asc' }] });
  if (previousCompanyProfile) {
    await prisma.companyProfile.upsert({
      where: { id: previousCompanyProfile.id },
      create: {
        id: previousCompanyProfile.id,
        title: previousCompanyProfile.title,
        subtitle: previousCompanyProfile.subtitle,
        coverImage: previousCompanyProfile.coverImage,
        galleryJson: toNullableJson(previousCompanyProfile.galleryJson),
        content: previousCompanyProfile.content,
        contactPhone: previousCompanyProfile.contactPhone,
        contactWechat: previousCompanyProfile.contactWechat,
        address: previousCompanyProfile.address,
        sort: previousCompanyProfile.sort,
        status: previousCompanyProfile.status,
        createdAt: previousCompanyProfile.createdAt,
        updatedAt: previousCompanyProfile.updatedAt,
      },
      update: {
        title: previousCompanyProfile.title,
        subtitle: previousCompanyProfile.subtitle,
        coverImage: previousCompanyProfile.coverImage,
        galleryJson: toNullableJson(previousCompanyProfile.galleryJson),
        content: previousCompanyProfile.content,
        contactPhone: previousCompanyProfile.contactPhone,
        contactWechat: previousCompanyProfile.contactWechat,
        address: previousCompanyProfile.address,
        sort: previousCompanyProfile.sort,
        status: previousCompanyProfile.status,
      },
    });
  } else if (currentProfile) {
    await prisma.companyProfile.delete({ where: { id: currentProfile.id } });
  }

  const currentBranding = await prisma.homepageBranding.findFirst({ orderBy: { id: 'asc' } });
  if (previousBranding) {
    await prisma.homepageBranding.upsert({
      where: { id: previousBranding.id },
      create: previousBranding,
      update: {
        siteName: previousBranding.siteName,
        siteSubtitle: previousBranding.siteSubtitle,
        logoImage: previousBranding.logoImage,
        headerNotice: previousBranding.headerNotice,
        themeMode: previousBranding.themeMode,
        status: previousBranding.status,
      },
    });
  } else if (currentBranding) {
    await prisma.homepageBranding.delete({ where: { id: currentBranding.id } });
  }
}

function toNullableJson(value: Prisma.JsonValue) {
  return value === null ? Prisma.JsonNull : value;
}
