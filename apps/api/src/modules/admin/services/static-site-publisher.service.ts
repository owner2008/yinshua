import { Inject, Injectable, Optional } from '@nestjs/common';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { PrismaService } from '../../../database/prisma.service';

export interface StaticSitePublisherOptions {
  outputDir?: string;
  publicOrigin?: string;
}

export interface StaticSitePublishResult {
  outputDir: string;
  files: string[];
  generatedAt: string;
}

export const STATIC_SITE_PUBLISHER_OPTIONS = Symbol('STATIC_SITE_PUBLISHER_OPTIONS');

type StaticProduct = {
  id: bigint | number | string;
  name: string;
  code?: string | null;
  description?: string | null;
  coverImage?: string | null;
  galleryJson?: unknown;
  applicationScenario?: string | null;
  category?: { name?: string | null } | null;
};

type StaticCategory = {
  id: bigint | number | string;
  name: string;
};

type StaticCompanyProfile = {
  title?: string | null;
  subtitle?: string | null;
  coverImage?: string | null;
  galleryJson?: unknown;
  content?: string | null;
  contactPhone?: string | null;
  contactWechat?: string | null;
  address?: string | null;
};

type StaticBranding = {
  siteName?: string | null;
  siteSubtitle?: string | null;
  logoImage?: string | null;
};

type StaticBanner = {
  title?: string | null;
  subtitle?: string | null;
  imageUrl?: string | null;
};

type StaticShowcase = {
  id: bigint | number | string;
  name: string;
  title?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  category?: { name?: string | null } | null;
};

type StaticPrisma = {
  homepageBranding: {
    findFirst(args: unknown): Promise<StaticBranding | null>;
  };
  companyProfile: {
    findFirst(args: unknown): Promise<StaticCompanyProfile | null>;
  };
  homepageBanner: {
    findMany(args: unknown): Promise<StaticBanner[]>;
  };
  productCategory: {
    findMany(args: unknown): Promise<StaticCategory[]>;
  };
  product: {
    findMany(args: unknown): Promise<StaticProduct[]>;
  };
  categoryEquipmentShowcase: {
    findMany(args: unknown): Promise<StaticShowcase[]>;
  };
};

@Injectable()
export class StaticSitePublisherService {
  private readonly outputDir: string;
  private readonly publicOrigin: string;

  constructor(
    private readonly prisma: PrismaService,
    @Optional()
    @Inject(STATIC_SITE_PUBLISHER_OPTIONS)
    options: StaticSitePublisherOptions = {},
  ) {
    this.outputDir = resolve(options.outputDir ?? process.env.STATIC_SITE_OUTPUT_DIR ?? join(process.cwd(), '..', 'dist'));
    this.publicOrigin = normalizeOrigin(options.publicOrigin ?? process.env.PUBLIC_SITE_ORIGIN ?? process.env.SITE_ORIGIN ?? '');
  }

  async publish(): Promise<StaticSitePublishResult> {
    const generatedAt = new Date().toISOString();
    const content = await this.loadContent();
    const pages = this.buildPages(content);
    const files: string[] = [];

    for (const page of pages) {
      await this.writeTextFile(page.file, page.content);
      files.push(page.file);
    }

    const sitemap = this.renderSitemap(pages.filter((page) => page.urlPath));
    await this.writeTextFile('sitemap.xml', sitemap);
    files.push('sitemap.xml');

    await this.writeTextFile('robots.txt', this.renderRobots());
    files.push('robots.txt');

    return {
      outputDir: this.outputDir,
      files,
      generatedAt,
    };
  }

  private async loadContent() {
    const prisma = this.prisma as StaticPrisma;
    const now = new Date();
    const [branding, company, banners, categories, products, showcases] = await Promise.all([
      prisma.homepageBranding.findFirst({
        where: { status: 'active' },
        orderBy: { id: 'asc' },
      }),
      prisma.companyProfile.findFirst({
        where: { status: 'active' },
        orderBy: [{ sort: 'asc' }, { id: 'asc' }],
      }),
      prisma.homepageBanner.findMany({
        where: {
          status: 'active',
          OR: [{ startAt: null }, { startAt: { lte: now } }],
          AND: [{ OR: [{ endAt: null }, { endAt: { gte: now } }] }],
        },
        orderBy: [{ sort: 'asc' }, { id: 'asc' }],
      }),
      prisma.productCategory.findMany({
        where: { status: 'active' },
        orderBy: [{ sort: 'asc' }, { id: 'asc' }],
      }),
      prisma.product.findMany({
        where: { status: 'active' },
        orderBy: [{ sort: 'asc' }, { id: 'desc' }],
        include: { category: true },
      }),
      prisma.categoryEquipmentShowcase.findMany({
        where: { status: 'active' },
        orderBy: [{ sort: 'asc' }, { id: 'asc' }],
        include: { category: true },
      }),
    ]);
    return { branding, company, banners, categories, products, showcases };
  }

  private buildPages(content: Awaited<ReturnType<StaticSitePublisherService['loadContent']>>) {
    const siteName = content.branding?.siteName?.trim() || '东方丽彩印刷';
    const siteSubtitle = content.branding?.siteSubtitle?.trim() || '青岛标签与包装印刷服务商';
    const company = content.company;
    const products = content.products;
    const categories = content.categories;
    const showcases = content.showcases;
    const applications = collectApplications(products, categories);

    const pages: Array<{ file: string; urlPath: string; content: string }> = [
      {
        file: 'index.html',
        urlPath: '/',
        content: this.renderPage({
          title: `${siteName}_青岛标签印刷_不干胶标签定制厂家`,
          description: `${siteName}${siteSubtitle}，提供标签、包装、说明书、宣传册印刷服务。`,
          path: '/',
          h1: content.banners[0]?.title || siteName,
          lead: content.banners[0]?.subtitle || siteSubtitle,
          body: [
            renderImage(content.banners[0]?.imageUrl || company?.coverImage, content.banners[0]?.title || siteName),
            renderSection('主营产品', products.map((item) => renderLinkedCard(`/products/${idToString(item.id)}/`, item.name, item.description, item.coverImage)).join('')),
            renderSection('行业应用', applications.map((item) => `<li>${escapeHtml(item)}</li>`).join(''), 'ul'),
            renderSection('企业优势', escapeHtml(company?.content || '专业印刷设备与稳定生产流程，服务标签、包装、说明书、宣传册等多类印刷需求。')),
          ].join(''),
        }),
      },
      {
        file: 'products/index.html',
        urlPath: '/products/',
        content: this.renderPage({
          title: `产品中心_标签印刷_包装印刷_${siteName}`,
          description: `${siteName}产品中心，提供不干胶标签、卷标标签、产品说明书、包装盒彩盒、宣传册等印刷产品。`,
          path: '/products/',
          h1: '产品中心',
          lead: '多种印刷产品与解决方案，满足不同行业需求。',
          body: products.map((item) => renderLinkedCard(`/products/${idToString(item.id)}/`, item.name, item.description, item.coverImage)).join(''),
        }),
      },
      {
        file: 'applications/index.html',
        urlPath: '/applications/',
        content: this.renderPage({
          title: `行业应用_食品日化医药标签印刷_${siteName}`,
          description: `${siteName}服务食品饮料、日化美妆、医药保健、电子电器、物流零售等行业印刷需求。`,
          path: '/applications/',
          h1: '行业应用',
          lead: '覆盖食品、日化、医药、电子、物流等多场景。',
          body: renderSection('应用场景', applications.map((item) => `<li>${escapeHtml(item)}</li>`).join(''), 'ul'),
        }),
      },
      {
        file: 'cases/index.html',
        urlPath: '/cases/',
        content: this.renderPage({
          title: `产品案例_标签包装印刷案例_${siteName}`,
          description: `${siteName}产品案例展示，覆盖标签卷标、包装、说明书、宣传册与二维码标签等印刷案例。`,
          path: '/cases/',
          h1: '产品案例',
          lead: '多行业客户的品质之选。',
          body: showcases.map((item) => renderCard(item.title || item.name, item.description, item.imageUrl)).join(''),
        }),
      },
      {
        file: 'contact/index.html',
        urlPath: '/contact/',
        content: this.renderPage({
          title: `联系我们_${siteName}`,
          description: `联系${siteName}，咨询青岛标签印刷、不干胶标签定制、包装说明书印刷服务。`,
          path: '/contact/',
          h1: '联系我们',
          lead: '期待与您合作，共创美好未来。',
          body: [
            `<p>电话：${escapeHtml(company?.contactPhone || '0532-5828-8288')}</p>`,
            company?.contactWechat ? `<p>微信：${escapeHtml(company.contactWechat)}</p>` : '',
            `<p>地址：${escapeHtml(company?.address || '山东省青岛市')}</p>`,
          ].join(''),
        }),
      },
    ];

    for (const product of products) {
      pages.push({
        file: `products/${idToString(product.id)}/index.html`,
        urlPath: `/products/${idToString(product.id)}/`,
        content: this.renderProductPage(product, siteName),
      });
    }

    return pages;
  }

  private renderProductPage(product: StaticProduct, siteName: string) {
    const path = `/products/${idToString(product.id)}/`;
    const title = `${prefixQingdao(product.name)}_${siteName}`;
    const description = product.description?.trim() || `${siteName}提供${product.name}定制印刷服务，支持多种材质、工艺和行业应用。`;
    const gallery = normalizeStringArray(product.galleryJson);
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description,
      image: toAbsoluteUrl(product.coverImage || gallery[0], this.publicOrigin),
      brand: {
        '@type': 'Brand',
        name: siteName,
      },
      category: product.category?.name,
    };
    return this.renderPage({
      title,
      description,
      path,
      h1: product.name,
      lead: product.applicationScenario || product.category?.name || '标签包装印刷定制服务',
      body: [
        renderImage(product.coverImage, product.name),
        `<p>${escapeHtml(description)}</p>`,
        product.applicationScenario ? `<p>${escapeHtml(product.applicationScenario)}</p>` : '',
        gallery.map((image) => renderImage(image, product.name)).join(''),
      ].join(''),
      jsonLd,
    });
  }

  private renderPage(input: {
    title: string;
    description: string;
    path: string;
    h1: string;
    lead: string;
    body: string;
    jsonLd?: Record<string, unknown>;
  }) {
    const canonical = toAbsoluteUrl(input.path, this.publicOrigin);
    return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(input.title)}</title>
  <meta name="description" content="${escapeAttribute(input.description)}" />
  <link rel="canonical" href="${escapeAttribute(canonical)}" />
  ${input.jsonLd ? `<script type="application/ld+json">${JSON.stringify(input.jsonLd)}</script>` : ''}
  <style>
    body{margin:0;font-family:Arial,"Microsoft YaHei",sans-serif;color:#10264d;background:#f6fbff;line-height:1.7}
    header,main,footer{max-width:1100px;margin:0 auto;padding:24px}
    header{display:flex;align-items:center;justify-content:space-between;background:#fff}
    nav a{margin-left:16px;color:#075bd2;text-decoration:none;font-weight:700}
    h1{font-size:40px;line-height:1.2;margin:32px 0 12px}
    h2{font-size:28px;margin:32px 0 12px}
    .lead{font-size:20px;color:#456082}
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px}
    .card{display:block;padding:18px;border:1px solid #dce9f8;border-radius:8px;background:#fff;color:#10264d;text-decoration:none}
    img{max-width:100%;height:auto;border-radius:8px}
    footer{color:#60708c}
  </style>
</head>
<body>
  <header>
    <strong>东方丽彩印刷</strong>
    <nav>
      <a href="/">首页</a>
      <a href="/products/">产品中心</a>
      <a href="/applications/">行业应用</a>
      <a href="/cases/">产品案例</a>
      <a href="/contact/">联系我们</a>
    </nav>
  </header>
  <main>
    <h1>${escapeHtml(input.h1)}</h1>
    <p class="lead">${escapeHtml(input.lead)}</p>
    ${input.body}
  </main>
  <footer>© ${new Date().getFullYear()} 东方丽彩印刷</footer>
</body>
</html>`;
  }

  private renderSitemap(pages: Array<{ urlPath: string }>) {
    const urls = pages
      .map((page) => `  <url><loc>${escapeHtml(toAbsoluteUrl(page.urlPath, this.publicOrigin))}</loc></url>`)
      .join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  }

  private renderRobots() {
    return `User-agent: *\nAllow: /\nSitemap: ${toAbsoluteUrl('/sitemap.xml', this.publicOrigin)}\n`;
  }

  private async writeTextFile(relativePath: string, content: string) {
    const target = join(this.outputDir, relativePath);
    await mkdir(join(target, '..'), { recursive: true });
    await writeFile(target, content, 'utf8');
  }
}

function renderSection(title: string, body: string, tag = 'div') {
  const content = tag === 'ul' ? `<ul>${body}</ul>` : `<div class="grid">${body}</div>`;
  return `<section><h2>${escapeHtml(title)}</h2>${content}</section>`;
}

function renderLinkedCard(href: string, title: string, description?: string | null, image?: string | null) {
  return `<a class="card" href="${escapeAttribute(href)}">${renderImage(image, title)}<h2>${escapeHtml(title)}</h2><p>${escapeHtml(description || '')}</p></a>`;
}

function renderCard(title: string, description?: string | null, image?: string | null) {
  return `<article class="card">${renderImage(image, title)}<h2>${escapeHtml(title)}</h2><p>${escapeHtml(description || '')}</p></article>`;
}

function renderImage(src?: string | null, alt?: string | null) {
  return src ? `<img src="${escapeAttribute(src)}" alt="${escapeAttribute(alt || '')}" loading="lazy" />` : '';
}

function collectApplications(products: StaticProduct[], categories: StaticCategory[]) {
  const values = [
    ...products.flatMap((product) => splitChineseList(product.applicationScenario)),
    ...categories.map((category) => category.name),
    '食品饮料',
    '日化美妆',
    '医药保健',
    '电子电器',
    '仓储物流',
    '商超零售',
  ];
  return Array.from(new Set(values.map((item) => item.trim()).filter(Boolean))).slice(0, 16);
}

function splitChineseList(value?: string | null) {
  return value ? value.split(/[、,，/|]/g) : [];
}

function normalizeStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : [];
}

function prefixQingdao(value: string) {
  return value.includes('青岛') ? value : `青岛${value}`;
}

function idToString(value: bigint | number | string) {
  return String(value);
}

function normalizeOrigin(origin: string) {
  const fallback = 'https://www.dongfanglicai.com';
  return (origin || fallback).replace(/\/+$/, '');
}

function toAbsoluteUrl(path: string | null | undefined, origin: string) {
  if (!path) {
    return '';
  }
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`;
}

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttribute(value: unknown) {
  return escapeHtml(value).replace(/\n/g, ' ');
}
