import { PrismaClient } from '@prisma/client';
import { createHash, randomBytes } from 'node:crypto';

const prisma = new PrismaClient();
const startedAt = new Date('2026-04-21T00:00:00+08:00');

type TemplateSpec = {
  id: bigint;
  productId: bigint;
  templateName: string;
  widthMin: number;
  widthMax: number;
  heightMin: number;
  heightMax: number;
  quantityMin: number;
  quantityMax: number;
  defaultLossRate: number;
  minPrice: number;
  materials: Array<[string, string]>;
  processes: Array<[string, string]>;
  printModes: Array<[string, string]>;
  shapes: Array<[string, string]>;
};

const MATERIALS = {
  coated: ['1', '铜版纸'] as [string, string],
  pet: ['2', 'PET / 透明膜'] as [string, string],
  pp: ['3', 'PP 合成膜'] as [string, string],
  silver: ['4', '哑银 PET'] as [string, string],
  fragile: ['5', '防伪易碎纸'] as [string, string],
};

const PROCESSES = {
  lamination: ['lamination', '覆膜'] as [string, string],
  dieCut: ['die_cut', '模切'] as [string, string],
  uv: ['uv', '局部 UV'] as [string, string],
  hotStamp: ['hot_stamp', '烫金'] as [string, string],
  variable: ['variable_data', '可变二维码'] as [string, string],
  proofing: ['proofing', '打样'] as [string, string],
};

const PRINT_MODES = [
  ['four_color', '四色印刷'],
  ['single_color', '单色印刷'],
  ['white_ink', '四色 + 白墨'],
] as Array<[string, string]>;

const SHAPES = [
  ['rectangle', '矩形'],
  ['custom', '异形'],
] as Array<[string, string]>;

const TEMPLATES: TemplateSpec[] = [
  template(1, 1, '不干胶标签标准报价模板', [MATERIALS.coated, MATERIALS.pet], [PROCESSES.lamination, PROCESSES.dieCut, PROCESSES.proofing]),
  template(2, 2, '卷标标签批量报价模板', [MATERIALS.coated, MATERIALS.pp], [PROCESSES.lamination, PROCESSES.dieCut, PROCESSES.proofing]),
  template(3, 3, '食品饮料标签报价模板', [MATERIALS.coated, MATERIALS.pet], [PROCESSES.lamination, PROCESSES.dieCut, PROCESSES.proofing]),
  template(4, 4, '日化美妆标签报价模板', [MATERIALS.pet, MATERIALS.pp], [PROCESSES.lamination, PROCESSES.hotStamp, PROCESSES.uv, PROCESSES.dieCut]),
  template(5, 5, '医药保健标签报价模板', [MATERIALS.coated], [PROCESSES.lamination, PROCESSES.dieCut, PROCESSES.proofing]),
  template(6, 6, '工业电子标签报价模板', [MATERIALS.silver, MATERIALS.pet], [PROCESSES.lamination, PROCESSES.dieCut, PROCESSES.proofing]),
  template(7, 7, '防伪标签报价模板', [MATERIALS.fragile, MATERIALS.pet], [PROCESSES.dieCut, PROCESSES.variable, PROCESSES.proofing]),
  template(8, 8, '可变二维码标签报价模板', [MATERIALS.coated, MATERIALS.pet], [PROCESSES.variable, PROCESSES.dieCut, PROCESSES.proofing]),
  template(9, 9, '产品说明书报价模板', [MATERIALS.coated], [PROCESSES.dieCut], { widthMax: 500, heightMax: 600, quantityMin: 100, quantityMax: 50000, minPrice: 500 }),
  template(10, 10, '包装盒宣传册报价模板', [MATERIALS.coated], [PROCESSES.lamination, PROCESSES.hotStamp, PROCESSES.uv], { widthMax: 500, heightMax: 600, quantityMin: 100, quantityMax: 50000, minPrice: 600 }),
];

function template(
  id: number,
  productId: number,
  templateName: string,
  materials: Array<[string, string]>,
  processes: Array<[string, string]>,
  overrides: Partial<TemplateSpec> = {},
): TemplateSpec {
  return {
    id: BigInt(id),
    productId: BigInt(productId),
    templateName,
    widthMin: overrides.widthMin ?? 20,
    widthMax: overrides.widthMax ?? 420,
    heightMin: overrides.heightMin ?? 20,
    heightMax: overrides.heightMax ?? 420,
    quantityMin: overrides.quantityMin ?? 500,
    quantityMax: overrides.quantityMax ?? 300000,
    defaultLossRate: overrides.defaultLossRate ?? 1.08,
    minPrice: overrides.minPrice ?? 220,
    materials,
    processes,
    printModes: PRINT_MODES,
    shapes: SHAPES,
  };
}

async function main() {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminUsername || !adminPassword || adminPassword.length < 16) {
    throw new Error('Set ADMIN_USERNAME and an ADMIN_PASSWORD of at least 16 characters before seeding');
  }
  await seedCategories();
  await seedContentManagement();
  await seedProducts();
  await seedTemplates();
  await seedMaterials();
  await seedProcesses();
  await seedPrintPrices();
  await seedRules();
  await seedMemberLevels();
  await seedAdminAccount(adminUsername, adminPassword);
}

async function seedCategories() {
  const categories = [
    [1n, '不干胶标签', 10],
    [2n, '卷标标签', 20],
    [3n, '食品饮料标签', 30],
    [4n, '日化美妆标签', 40],
    [5n, '医药保健标签', 50],
    [6n, '工业电子标签', 60],
    [7n, '防伪标签', 70],
    [8n, '可变二维码 / 一物一码标签', 80],
    [9n, '产品说明书', 90],
    [10n, '包装盒 / 宣传册印刷', 100],
  ] as const;

  for (const [id, name, sort] of categories) {
    await prisma.productCategory.upsert({
      where: { id },
      update: { name, sort, status: 'active' },
      create: { id, name, sort },
    });
  }
}

async function seedContentManagement() {
  await prisma.companyProfile.upsert({
    where: { id: 1n },
    update: companyProfileData(),
    create: { id: 1n, ...companyProfileData() },
  });

  await prisma.homepageBranding.upsert({
    where: { id: 1n },
    update: brandingData(),
    create: { id: 1n, ...brandingData() },
  });

  const banners = [
    {
      id: 1n,
      title: '专业标签印刷与一物一码解决方案',
      subtitle: '不干胶标签、卷标、可变二维码、防伪标签与包装印刷一站式定制。',
      imageUrl: 'https://dummyimage.com/1440x560/071a30/ffffff&text=Label+Printing',
      mobileImageUrl: 'https://dummyimage.com/720x960/071a30/ffffff&text=Label+Printing',
      linkType: 'category',
      linkValue: '1',
      buttonText: '查看产品',
      sort: 10,
    },
    {
      id: 2n,
      title: '可变二维码与防伪追溯标签',
      subtitle: '支持一物一码、渠道追溯、防伪验证和营销活动。',
      imageUrl: 'https://dummyimage.com/1440x560/0a6cff/ffffff&text=QR+Labels',
      mobileImageUrl: 'https://dummyimage.com/720x960/0a6cff/ffffff&text=QR+Labels',
      linkType: 'product',
      linkValue: '8',
      buttonText: '立即询价',
      sort: 20,
    },
  ] as const;

  for (const banner of banners) {
    await prisma.homepageBanner.upsert({
      where: { id: banner.id },
      update: { ...banner, status: 'active', startAt: startedAt, endAt: null },
      create: { ...banner, status: 'active', startAt: startedAt },
    });
  }

  const showcases = [
    showcase(1, 3, '食品瓶贴案例', 'PET + 覆亮膜，冷藏环境粘性稳定', 'https://dummyimage.com/960x640/00a886/ffffff&text=Food+Label'),
    showcase(2, 4, '化妆品标签案例', '透明膜 + 烫金，提升货架质感', 'https://dummyimage.com/960x640/ff7a1a/ffffff&text=Beauty+Label'),
    showcase(3, 8, '二维码溯源标签案例', '可变数据印刷，支持扫码追溯防伪', 'https://dummyimage.com/960x640/0a6cff/ffffff&text=QR+Traceability'),
  ];

  for (const item of showcases) {
    await prisma.categoryEquipmentShowcase.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    });
  }
}

function companyProfileData() {
  return {
    title: '青岛东方丽彩包装印刷公司',
    subtitle: '专注标签印刷、包装定制与数字溯源服务',
    coverImage: 'https://dummyimage.com/1200x600/071a30/ffffff&text=Factory',
    galleryJson: [
      'https://dummyimage.com/1200x600/0a6cff/ffffff&text=Production',
      'https://dummyimage.com/1200x600/00a886/ffffff&text=Quality',
    ],
    content: '公司面向食品饮料、日化美妆、医药保健、工业制造、电商物流等企业客户，提供标签印刷、卷标不干胶、产品说明书、包装印刷、可变二维码、防伪标签等定制服务。',
    contactPhone: '400-000-0000',
    contactWechat: 'DFLC-label',
    address: '青岛市包装印刷产业园区',
    sort: 1,
    status: 'active',
  };
}

function brandingData() {
  return {
    siteName: '青岛东方丽彩包装印刷公司',
    siteSubtitle: '标签印刷 / 包装定制 / 数字溯源',
    logoImage: 'https://dummyimage.com/320x120/071a30/ffffff&text=DFLC',
    headerNotice: '支持在线报价、批量生产、打样确认与多行业定制。',
    themeMode: 'graphite',
    status: 'active',
  };
}

function showcase(id: number, categoryId: number, title: string, description: string, imageUrl: string) {
  return {
    id: BigInt(id),
    categoryId: BigInt(categoryId),
    name: title,
    title,
    description,
    imageUrl,
    galleryJson: [imageUrl],
    specsJson: {
      material: description.split('，')[0],
      process: '覆膜 / 模切 / 可变数据',
      delivery: '支持打样确认',
    },
    sort: id * 10,
    status: 'active',
  };
}

async function seedProducts() {
  const products = [
    [1n, 1n, 'STICKER-LABEL', '不干胶标签', '适用于食品、日化、工业等多场景标签印刷。', true],
    [2n, 2n, 'ROLL-LABEL', '卷标标签', '适合自动贴标和批量生产，交付稳定。', true],
    [3n, 3n, 'FOOD-DRINK-LABEL', '食品饮料标签', '耐冷藏、防潮，贴合瓶罐和外包装。', true],
    [4n, 4n, 'COSMETIC-LABEL', '日化美妆标签', '支持透明膜、烫金和局部 UV，提升货架质感。', true],
    [5n, 5n, 'MEDICAL-HEALTH-LABEL', '医药保健标签', '信息清晰、批量一致，适合药盒和瓶贴。', false],
    [6n, 6n, 'INDUSTRIAL-ELECTRONIC-LABEL', '工业电子标签', '耐磨耐候，适合设备铭牌和参数标签。', false],
    [7n, 7n, 'SECURITY-LABEL', '防伪标签', '适合封口、防拆、防伪和渠道管控。', false],
    [8n, 8n, 'QR-TRACEABILITY-LABEL', '可变二维码 / 一物一码标签', '支持一物一码、溯源、防伪和营销活动。', true],
    [9n, 9n, 'PRODUCT-MANUAL', '产品说明书', '折页、说明书、随箱资料配套印刷。', false],
    [10n, 10n, 'PACKAGING-BROCHURE', '包装盒 / 宣传册印刷', '品牌包装与宣传资料配套生产。', false],
  ] as const;

  for (const [id, categoryId, code, name, description, isHot] of products) {
    await prisma.product.upsert({
      where: { code },
      update: {
        categoryId,
        name,
        description,
        applicationScenario: description,
        isHot,
        sort: Number(id) * 10,
        status: 'active',
      },
      create: {
        id,
        categoryId,
        code,
        name,
        description,
        applicationScenario: description,
        isHot,
        sort: Number(id) * 10,
        status: 'active',
      },
    });
  }
}

async function seedTemplates() {
  for (const spec of TEMPLATES) {
    await prisma.productTemplate.upsert({
      where: { id: spec.id },
      update: templatePayload(spec),
      create: { id: spec.id, ...templatePayload(spec) },
    });

    const rows = [
      ...spec.materials.map(([value, label]) => ['material', value, label] as const),
      ...spec.processes.map(([value, label]) => ['process', value, label] as const),
      ...spec.printModes.map(([value, label]) => ['print_mode', value, label] as const),
      ...spec.shapes.map(([value, label]) => ['shape', value, label] as const),
    ];

    await prisma.productTemplateOption.deleteMany({ where: { templateId: spec.id } });
    await prisma.productTemplateOption.createMany({
      data: rows.map(([optionType, optionValue, optionLabel], index) => ({
        templateId: spec.id,
        optionType,
        optionValue,
        optionLabel,
        sort: index + 1,
      })),
    });
  }
}

function templatePayload(spec: TemplateSpec) {
  return {
    productId: spec.productId,
    templateName: spec.templateName,
    widthMin: spec.widthMin,
    widthMax: spec.widthMax,
    heightMin: spec.heightMin,
    heightMax: spec.heightMax,
    quantityMin: spec.quantityMin,
    quantityMax: spec.quantityMax,
    allowCustomShape: true,
    allowLamination: true,
    allowHotStamping: true,
    allowUv: true,
    allowDieCut: true,
    allowProofing: true,
    defaultLossRate: spec.defaultLossRate,
    minPrice: spec.minPrice,
    status: 'active',
  };
}

async function seedMaterials() {
  const materials = [
    [1n, 'COATED-PAPER', '铜版纸', 'face', 0.8],
    [2n, 'PET-CLEAR', 'PET / 透明膜', 'face', 1.5],
    [3n, 'PP-FILM', 'PP 合成膜', 'face', 1.2],
    [4n, 'SILVER-PET', '哑银 PET', 'face', 1.6],
    [5n, 'FRAGILE-SECURITY-PAPER', '防伪易碎纸', 'face', 1.8],
  ] as const;

  for (const [id, code, name, type, unitPrice] of materials) {
    await prisma.material.upsert({
      where: { code },
      update: { name, type, unit: 'm2' },
      create: { id, code, name, type, unit: 'm2' },
    });
    await prisma.materialPrice.updateMany({ where: { materialId: id, isCurrent: true }, data: { isCurrent: false } });
    await prisma.materialPrice.create({
      data: { materialId: id, priceType: 'calc', unitPrice, effectiveFrom: startedAt, isCurrent: true },
    });
  }
}

async function seedProcesses() {
  const processes = [
    [1n, 'lamination', '覆膜', 'surface', 'per_area', 0.2, 0, 0],
    [2n, 'die_cut', '模切', 'cutting', 'fixed_plus_qty', 0.01, 80, 0],
    [3n, 'uv', '局部 UV', 'surface', 'per_area', 0.3, 0, 0],
    [4n, 'proofing', '打样', 'proof', 'fixed', 100, 0, 0],
    [5n, 'hot_stamp', '烫金', 'surface', 'per_area', 1.2, 100, 50],
    [6n, 'variable_data', '可变二维码', 'data', 'fixed_plus_qty', 0.006, 80, 80],
  ] as const;

  for (const [id, code, name, processType, feeMode, unitPrice, setupFee, minFee] of processes) {
    await prisma.process.upsert({
      where: { code },
      update: { name, processType, feeMode },
      create: { id, code, name, processType, feeMode },
    });
    await prisma.processPrice.updateMany({ where: { processId: id, isCurrent: true }, data: { isCurrent: false } });
    await prisma.processPrice.create({
      data: { processId: id, feeMode, unitPrice, setupFee, minFee, effectiveFrom: startedAt, isCurrent: true },
    });
  }
}

async function seedPrintPrices() {
  await prisma.printPrice.updateMany({ where: { isCurrent: true }, data: { isCurrent: false } });
  await prisma.printPrice.createMany({
    data: [
      { printMode: 'four_color', feeMode: 'per_qty', unitPrice: 0.03, setupFee: 50, effectiveFrom: startedAt, isCurrent: true },
      { printMode: 'single_color', feeMode: 'per_qty', unitPrice: 0.02, setupFee: 50, effectiveFrom: startedAt, isCurrent: true },
      { printMode: 'white_ink', feeMode: 'per_qty', unitPrice: 0.04, setupFee: 80, effectiveFrom: startedAt, isCurrent: true },
    ],
  });
}

async function seedRules() {
  const scenes = [
    { scene: 'retail', customerType: 'personal', memberRate: 1 },
    { scene: 'enterprise', customerType: 'company', memberRate: 0.95 },
  ] as const;

  for (const spec of TEMPLATES) {
    for (const [index, { scene, customerType, memberRate }] of scenes.entries()) {
      const ruleSetId = BigInt((Number(spec.id) - 1) * scenes.length + index + 1);
      await prisma.quoteRuleSet.upsert({
        where: { id: ruleSetId },
        update: {
          productTemplateId: spec.id,
          name: `${spec.templateName}-${scene === 'enterprise' ? '企业' : '个人'}规则`,
          scene,
          versionNo: `RULE-T${spec.id}-${scene.toUpperCase()}-V1`,
          status: 'active',
          priority: index + 1,
        },
        create: {
          id: ruleSetId,
          productTemplateId: spec.id,
          name: `${spec.templateName}-${scene === 'enterprise' ? '企业' : '个人'}规则`,
          scene,
          versionNo: `RULE-T${spec.id}-${scene.toUpperCase()}-V1`,
          priority: index + 1,
          effectiveFrom: startedAt,
        },
      });
      await prisma.quoteRule.deleteMany({ where: { ruleSetId } });
      await prisma.quoteRule.create({
        data: {
          ruleSetId,
          conditionJson: {
            quantityRange: [spec.quantityMin, spec.quantityMax],
            widthRange: [spec.widthMin, spec.widthMax],
            heightRange: [spec.heightMin, spec.heightMax],
            customerTypes: [customerType],
          },
          configJson: {
            lossRate: spec.defaultLossRate,
            profitRate: 1.35,
            memberRate,
            minPrice: spec.minPrice,
            packageFee: 20,
            urgentFeeRate: 0.15,
            whiteInkUnitPrice: 0.35,
            whiteInkSetupFee: 50,
            whiteInkMinFee: 80,
            variableDataUnitPrice: 0.006,
            variableDataMinFee: 80,
            protectiveFinishUnitPrice: 0.08,
            protectiveFinishMinFee: 30,
            rollSplitFeePerRoll: 2,
            sheetCuttingFee: 30,
            fanFoldFee: 50,
          },
        },
      });
    }
  }
}

async function seedMemberLevels() {
  const levels = [
    [1n, 'REGULAR', '普通会员', 1, 0, '默认会员等级'],
    [2n, 'SILVER', '银牌会员', 0.98, 10, '稳定复购客户'],
    [3n, 'GOLD', '金牌会员', 0.95, 20, '重点维护客户'],
    [4n, 'ENTERPRISE', '企业会员', 0.92, 30, '企业长期合作客户'],
  ] as const;

  for (const [id, code, name, discountRate, priority, remark] of levels) {
    await prisma.memberLevel.upsert({
      where: { code },
      update: { name, discountRate, priority, remark },
      create: { id, code, name, discountRate, priority, remark },
    });
  }
}

async function seedAdminAccount(username: string, password: string) {
  const permissions = [
    ['admin:product', '产品与模板管理', 'product'],
    ['admin:content', '展示内容管理', 'content'],
    ['admin:pricing', '材料、工艺与价格管理', 'pricing'],
    ['admin:quote-rule', '报价规则管理', 'quote-rule'],
    ['admin:quote', '报价单查看', 'quote'],
    ['admin:member', '会员管理', 'member'],
    ['admin:inventory', '库存管理', 'inventory'],
    ['admin:audit-log', '操作日志查看', 'audit-log'],
    ['admin:permission', '管理员与权限管理', 'permission'],
  ] as const;

  for (const [code, name, module] of permissions) {
    await prisma.adminPermission.upsert({
      where: { code },
      update: { name, module },
      create: { code, name, module },
    });
  }

  const role = await prisma.adminRole.upsert({
    where: { code: 'super_admin' },
    update: { name: '超级管理员', status: 'active' },
    create: { code: 'super_admin', name: '超级管理员', description: '拥有后台全部操作权限' },
  });

  for (const [code] of permissions) {
    const permission = await prisma.adminPermission.findUniqueOrThrow({ where: { code } });
    await prisma.adminRolePermission.upsert({
      where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
      update: {},
      create: { roleId: role.id, permissionId: permission.id },
    });
  }

  const adminUser = await prisma.adminUser.upsert({
    where: { username },
    update: { displayName: '系统管理员' },
    create: { username, displayName: '系统管理员', passwordHash: hashPassword(password) },
  });

  await prisma.adminUserRole.upsert({
    where: { adminUserId_roleId: { adminUserId: adminUser.id, roleId: role.id } },
    update: {},
    create: { adminUserId: adminUser.id, roleId: role.id },
  });
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const digest = createHash('sha256').update(`${salt}:${password}`).digest('hex');
  return `sha256:${salt}:${digest}`;
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
