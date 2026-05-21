import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { PrismaService } from '../../../database/prisma.service';
import { StaticSitePublisherService } from './static-site-publisher.service';

describe('StaticSitePublisherService', () => {
  it('publishes crawler-readable html pages, sitemap, and robots file', async () => {
    const outputDir = await mkdtemp(join(tmpdir(), 'yinshua-static-site-'));
    const service = new StaticSitePublisherService(createPrismaStub() as unknown as PrismaService, {
      outputDir,
      publicOrigin: 'https://www.example.com',
    });

    try {
      const result = await service.publish();

      assert.equal(result.outputDir, outputDir);
      assert.ok(result.generatedAt);
      assert.deepEqual(
        result.files.sort(),
        [
          'applications/index.html',
          'cases/index.html',
          'contact/index.html',
          'index.html',
          'products/1/index.html',
          'products/index.html',
          'robots.txt',
          'sitemap.xml',
        ].sort(),
      );

      await assertFileExists(join(outputDir, 'index.html'));
      await assertFileExists(join(outputDir, 'products', 'index.html'));
      await assertFileExists(join(outputDir, 'products', '1', 'index.html'));
      await assertFileExists(join(outputDir, 'applications', 'index.html'));
      await assertFileExists(join(outputDir, 'cases', 'index.html'));
      await assertFileExists(join(outputDir, 'contact', 'index.html'));

      const productHtml = await readFile(join(outputDir, 'products', '1', 'index.html'), 'utf8');
      assert.match(productHtml, /<title>青岛不干胶标签印刷_东方丽彩印刷<\/title>/);
      assert.match(productHtml, /<meta name="description" content="东方丽彩提供青岛不干胶标签定制印刷/);
      assert.match(productHtml, /<h1>不干胶标签印刷<\/h1>/);
      assert.match(productHtml, /<link rel="canonical" href="https:\/\/www\.example\.com\/products\/1\/" \/>/);
      assert.match(productHtml, /"@type":"Product"/);
      assert.match(productHtml, /食品饮料、日化美妆标签定制/);

      const sitemap = await readFile(join(outputDir, 'sitemap.xml'), 'utf8');
      assert.match(sitemap, /<loc>https:\/\/www\.example\.com\/products\/1\/<\/loc>/);
      assert.match(sitemap, /<loc>https:\/\/www\.example\.com\/cases\/<\/loc>/);

      const robots = await readFile(join(outputDir, 'robots.txt'), 'utf8');
      assert.match(robots, /Sitemap: https:\/\/www\.example\.com\/sitemap\.xml/);
    } finally {
      await rm(outputDir, { recursive: true, force: true });
    }
  });
});

async function assertFileExists(path: string) {
  const file = await stat(path);
  assert.equal(file.isFile(), true);
}

function createPrismaStub() {
  return {
    homepageBranding: {
      findFirst: async () => ({
        siteName: '东方丽彩印刷',
        siteSubtitle: '青岛标签与包装印刷服务商',
        logoImage: '/images/logo.png',
        headerNotice: '专注标签、包装、说明书、宣传册印刷',
        status: 'active',
      }),
    },
    companyProfile: {
      findFirst: async () => ({
        title: '青岛东方丽彩包装印刷有限公司',
        subtitle: '专业印刷，品质传递价值',
        coverImage: '/images/factory-workshop.jpg',
        galleryJson: ['/images/factory-workshop.jpg'],
        content: '东方丽彩提供标签、包装、说明书、宣传册等印刷服务。',
        contactPhone: '0532-5828-8288',
        contactWechat: 'dongfanglicai',
        address: '山东省青岛市',
        status: 'active',
      }),
    },
    homepageBanner: {
      findMany: async () => [
        {
          title: '专业标签印刷与包装印刷服务商',
          subtitle: '专注品质印刷，让产品更出彩',
          imageUrl: '/images/banner.png',
          status: 'active',
        },
      ],
    },
    productCategory: {
      findMany: async () => [
        {
          id: 1n,
          name: '标签卷标',
          status: 'active',
          sort: 1,
        },
      ],
    },
    product: {
      findMany: async () => [
        {
          id: 1n,
          name: '不干胶标签印刷',
          code: 'SELF-ADHESIVE-LABEL',
          status: 'active',
          description: '东方丽彩提供青岛不干胶标签定制印刷，适用于食品饮料、日化美妆标签定制。',
          coverImage: '/images/product-label-roll.jpg',
          galleryJson: ['/images/product-label-roll.jpg'],
          applicationScenario: '食品饮料、日化美妆标签定制',
          categoryId: 1n,
          category: { id: 1n, name: '标签卷标' },
          sort: 1,
          isHot: true,
        },
      ],
    },
    categoryEquipmentShowcase: {
      findMany: async () => [
        {
          id: 1n,
          categoryId: 1n,
          name: '食品瓶贴案例',
          title: '食品瓶贴案例',
          description: '冷藏环境粘性稳定，适合批量贴标。',
          imageUrl: '/images/case-food-packaging.jpg',
          galleryJson: ['/images/case-food-packaging.jpg'],
          specsJson: { material: 'PET' },
          sort: 1,
          status: 'active',
          category: { id: 1n, name: '标签卷标' },
        },
      ],
    },
  };
}
