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
  allowCustomShape?: boolean;
  allowLamination?: boolean;
  allowHotStamping?: boolean;
  allowUv?: boolean;
  allowDieCut?: boolean;
  allowProofing?: boolean;
  defaultLossRate: number;
  minPrice: number;
  materials: Array<[string, string]>;
  processes: Array<[string, string]>;
  printModes: Array<[string, string]>;
  shapes: Array<[string, string]>;
};

const TEMPLATES: TemplateSpec[] = [
  {
    id: 1n,
    productId: 1n,
    templateName: '透明膜标准报价模板',
    widthMin: 20,
    widthMax: 500,
    heightMin: 20,
    heightMax: 500,
    quantityMin: 100,
    quantityMax: 100000,
    allowCustomShape: true,
    allowLamination: true,
    allowUv: true,
    allowDieCut: true,
    allowProofing: true,
    defaultLossRate: 1.08,
    minPrice: 300,
    materials: [
      ['1', '铜版纸'],
      ['2', '透明膜'],
    ],
    processes: [
      ['lamination', '覆膜'],
      ['die_cut', '模切'],
      ['uv', '局部光油'],
      ['proofing', '打样'],
    ],
    printModes: [
      ['four_color', '四色印刷'],
      ['single_color', '单色印刷'],
    ],
    shapes: [
      ['rectangle', '矩形'],
      ['custom', '异形'],
    ],
  },
  {
    id: 2n,
    productId: 2n,
    templateName: '铜版纸彩色报价模板',
    widthMin: 30,
    widthMax: 400,
    heightMin: 20,
    heightMax: 400,
    quantityMin: 500,
    quantityMax: 200000,
    allowLamination: true,
    allowDieCut: true,
    allowProofing: true,
    defaultLossRate: 1.06,
    minPrice: 200,
    materials: [['1', '铜版纸']],
    processes: [
      ['lamination', '覆膜'],
      ['die_cut', '模切'],
      ['proofing', '打样'],
    ],
    printModes: [
      ['four_color', '四色印刷'],
      ['single_color', '单色印刷'],
    ],
    shapes: [['rectangle', '矩形']],
  },
  {
    id: 3n,
    productId: 3n,
    templateName: '烫金工艺报价模板',
    widthMin: 40,
    widthMax: 300,
    heightMin: 30,
    heightMax: 300,
    quantityMin: 200,
    quantityMax: 50000,
    allowCustomShape: true,
    allowHotStamping: true,
    allowDieCut: true,
    allowProofing: true,
    defaultLossRate: 1.1,
    minPrice: 500,
    materials: [
      ['1', '铜版纸'],
      ['2', '透明膜'],
    ],
    processes: [
      ['hot_stamp', '烫金'],
      ['die_cut', '模切'],
      ['proofing', '打样'],
    ],
    printModes: [['four_color', '四色印刷']],
    shapes: [
      ['rectangle', '矩形'],
      ['custom', '异形'],
    ],
  },
  {
    id: 4n,
    productId: 4n,
    templateName: '热敏物流报价模板',
    widthMin: 30,
    widthMax: 200,
    heightMin: 30,
    heightMax: 200,
    quantityMin: 1000,
    quantityMax: 500000,
    allowDieCut: true,
    defaultLossRate: 1.05,
    minPrice: 150,
    materials: [['4', '热敏纸']],
    processes: [['die_cut', '模切']],
    printModes: [['single_color', '单色印刷']],
    shapes: [['rectangle', '矩形']],
  },
  {
    id: 5n,
    productId: 5n,
    templateName: '合成纸耐候报价模板',
    widthMin: 30,
    widthMax: 450,
    heightMin: 20,
    heightMax: 450,
    quantityMin: 300,
    quantityMax: 100000,
    allowCustomShape: true,
    allowLamination: true,
    allowUv: true,
    allowDieCut: true,
    allowProofing: true,
    defaultLossRate: 1.08,
    minPrice: 320,
    materials: [['5', '合成纸']],
    processes: [
      ['lamination', '覆膜'],
      ['die_cut', '模切'],
      ['uv', '局部光油'],
      ['proofing', '打样'],
    ],
    printModes: [['four_color', '四色印刷']],
    shapes: [
      ['rectangle', '矩形'],
      ['custom', '异形'],
    ],
  },
  {
    id: 6n,
    productId: 6n,
    templateName: '食品饮料标签报价模板',
    widthMin: 25,
    widthMax: 380,
    heightMin: 20,
    heightMax: 380,
    quantityMin: 500,
    quantityMax: 200000,
    allowLamination: true,
    allowDieCut: true,
    allowProofing: true,
    defaultLossRate: 1.07,
    minPrice: 260,
    materials: [
      ['1', '铜版纸'],
      ['2', '透明膜'],
    ],
    processes: [
      ['lamination', '覆膜'],
      ['die_cut', '模切'],
      ['proofing', '打样'],
    ],
    printModes: [
      ['four_color', '四色印刷'],
      ['single_color', '单色印刷'],
    ],
    shapes: [
      ['rectangle', '矩形'],
      ['custom', '异形'],
    ],
  },
  {
    id: 7n,
    productId: 7n,
    templateName: '日化美妆标签报价模板',
    widthMin: 20,
    widthMax: 360,
    heightMin: 20,
    heightMax: 360,
    quantityMin: 500,
    quantityMax: 150000,
    allowCustomShape: true,
    allowLamination: true,
    allowHotStamping: true,
    allowUv: true,
    allowDieCut: true,
    allowProofing: true,
    defaultLossRate: 1.09,
    minPrice: 380,
    materials: [
      ['1', '铜版纸'],
      ['2', '透明膜'],
    ],
    processes: [
      ['lamination', '覆膜'],
      ['hot_stamp', '烫金'],
      ['uv', '局部光油'],
      ['die_cut', '模切'],
      ['proofing', '打样'],
    ],
    printModes: [['four_color', '四色印刷']],
    shapes: [
      ['rectangle', '矩形'],
      ['custom', '异形'],
    ],
  },
  {
    id: 8n,
    productId: 8n,
    templateName: '电子电器铭牌标签报价模板',
    widthMin: 15,
    widthMax: 300,
    heightMin: 10,
    heightMax: 300,
    quantityMin: 300,
    quantityMax: 100000,
    allowLamination: true,
    allowDieCut: true,
    allowProofing: true,
    defaultLossRate: 1.08,
    minPrice: 300,
    materials: [
      ['2', '透明膜'],
      ['5', '合成纸'],
    ],
    processes: [
      ['lamination', '覆膜'],
      ['die_cut', '模切'],
      ['proofing', '打样'],
    ],
    printModes: [
      ['four_color', '四色印刷'],
      ['single_color', '单色印刷'],
    ],
    shapes: [
      ['rectangle', '矩形'],
      ['custom', '异形'],
    ],
  },
  {
    id: 9n,
    productId: 9n,
    templateName: '医药保健标签报价模板',
    widthMin: 20,
    widthMax: 320,
    heightMin: 15,
    heightMax: 320,
    quantityMin: 1000,
    quantityMax: 300000,
    allowLamination: true,
    allowDieCut: true,
    allowProofing: true,
    defaultLossRate: 1.06,
    minPrice: 280,
    materials: [['1', '铜版纸']],
    processes: [
      ['lamination', '覆膜'],
      ['die_cut', '模切'],
      ['proofing', '打样'],
    ],
    printModes: [
      ['four_color', '四色印刷'],
      ['single_color', '单色印刷'],
    ],
    shapes: [['rectangle', '矩形']],
  },
  {
    id: 10n,
    productId: 10n,
    templateName: '防伪易碎标签报价模板',
    widthMin: 15,
    widthMax: 260,
    heightMin: 10,
    heightMax: 260,
    quantityMin: 500,
    quantityMax: 100000,
    allowCustomShape: true,
    allowDieCut: true,
    allowProofing: true,
    defaultLossRate: 1.12,
    minPrice: 420,
    materials: [['6', '易碎防伪纸']],
    processes: [
      ['die_cut', '模切'],
      ['proofing', '打样'],
    ],
    printModes: [
      ['four_color', '四色印刷'],
      ['single_color', '单色印刷'],
    ],
    shapes: [
      ['rectangle', '矩形'],
      ['custom', '异形'],
    ],
  },
  {
    id: 11n,
    productId: 11n,
    templateName: '包装封口标签报价模板',
    widthMin: 20,
    widthMax: 500,
    heightMin: 15,
    heightMax: 220,
    quantityMin: 500,
    quantityMax: 200000,
    allowCustomShape: true,
    allowLamination: true,
    allowDieCut: true,
    allowProofing: true,
    defaultLossRate: 1.07,
    minPrice: 220,
    materials: [
      ['1', '铜版纸'],
      ['2', '透明膜'],
    ],
    processes: [
      ['lamination', '覆膜'],
      ['die_cut', '模切'],
      ['proofing', '打样'],
    ],
    printModes: [['four_color', '四色印刷']],
    shapes: [
      ['rectangle', '矩形'],
      ['custom', '异形'],
    ],
  },
  {
    id: 12n,
    productId: 12n,
    templateName: '可移除标签报价模板',
    widthMin: 20,
    widthMax: 360,
    heightMin: 15,
    heightMax: 360,
    quantityMin: 500,
    quantityMax: 150000,
    allowCustomShape: true,
    allowDieCut: true,
    allowProofing: true,
    defaultLossRate: 1.08,
    minPrice: 300,
    materials: [['7', '可移除胶铜版纸']],
    processes: [
      ['die_cut', '模切'],
      ['proofing', '打样'],
    ],
    printModes: [
      ['four_color', '四色印刷'],
      ['single_color', '单色印刷'],
    ],
    shapes: [
      ['rectangle', '矩形'],
      ['custom', '异形'],
    ],
  },
];

async function main() {
  await seedCategories();
  await seedContentManagement();
  await seedProducts();
  await seedTemplates();
  await seedMaterials();
  await seedProcesses();
  await seedPrintPrices();
  await seedRules();
  await seedMemberLevels();
  await seedAdminAccount();
}

async function seedContentManagement() {
  await prisma.companyProfile.upsert({
    where: { id: 1n },
    update: {
      title: '专注不干胶印刷与标签解决方案',
      subtitle: '支持多行业标签展示、在线报价与后台参数化管理',
      coverImage: 'https://dummyimage.com/1200x600/0f172a/ffffff&text=Company+Profile',
      galleryJson: [
        'https://dummyimage.com/1200x600/1d4ed8/ffffff&text=Factory+View',
        'https://dummyimage.com/1200x600/2563eb/ffffff&text=Production+Line',
      ],
      content:
        '我们长期服务于食品饮料、日化美妆、物流快递、电子电器等行业，提供标签设计打样、材料选型、工艺组合与批量交付的一体化服务。',
      contactPhone: '400-800-2026',
      contactWechat: 'yinshua-service',
      address: '广东省深圳市龙岗区印刷智造产业园 A 栋 3 楼',
      sort: 1,
      status: 'active',
    },
    create: {
      id: 1n,
      title: '专注不干胶印刷与标签解决方案',
      subtitle: '支持多行业标签展示、在线报价与后台参数化管理',
      coverImage: 'https://dummyimage.com/1200x600/0f172a/ffffff&text=Company+Profile',
      galleryJson: [
        'https://dummyimage.com/1200x600/1d4ed8/ffffff&text=Factory+View',
        'https://dummyimage.com/1200x600/2563eb/ffffff&text=Production+Line',
      ],
      content:
        '我们长期服务于食品饮料、日化美妆、物流快递、电子电器等行业，提供标签设计打样、材料选型、工艺组合与批量交付的一体化服务。',
      contactPhone: '400-800-2026',
      contactWechat: 'yinshua-service',
      address: '广东省深圳市龙岗区印刷智造产业园 A 栋 3 楼',
      sort: 1,
      status: 'active',
    },
  });

  await prisma.homepageBranding.upsert({
    where: { id: 1n },
    update: {
      siteName: '印刷标签报价中心',
      siteSubtitle: '企业定制标签在线展示与参数化报价',
      logoImage: 'https://dummyimage.com/320x120/111827/ffffff&text=LOGO',
      headerNotice: '支持微信小程序与 H5 在线询价，后台统一配置内容与价格规则',
      themeMode: 'graphite',
      status: 'active',
    },
    create: {
      id: 1n,
      siteName: '印刷标签报价中心',
      siteSubtitle: '企业定制标签在线展示与参数化报价',
      logoImage: 'https://dummyimage.com/320x120/111827/ffffff&text=LOGO',
      headerNotice: '支持微信小程序与 H5 在线询价，后台统一配置内容与价格规则',
      themeMode: 'graphite',
      status: 'active',
    },
  });

  const banners = [
    {
      id: 1n,
      title: '多行业标签解决方案',
      subtitle: '食品、日化、物流、电器行业标签一站式打样与报价',
      imageUrl: 'https://dummyimage.com/1440x560/0f172a/ffffff&text=Industry+Solutions',
      mobileImageUrl: 'https://dummyimage.com/720x960/0f172a/ffffff&text=Industry+Solutions',
      linkType: 'category',
      linkValue: '5',
      buttonText: '查看方案',
      sort: 10,
    },
    {
      id: 2n,
      title: '透明膜与合成纸工艺专区',
      subtitle: '支持覆膜、烫金、局部 UV、异形模切等多种组合',
      imageUrl: 'https://dummyimage.com/1440x560/1d4ed8/ffffff&text=Special+Processes',
      mobileImageUrl: 'https://dummyimage.com/720x960/1d4ed8/ffffff&text=Special+Processes',
      linkType: 'product',
      linkValue: '3',
      buttonText: '立即查看',
      sort: 20,
    },
  ] as const;

  for (const banner of banners) {
    await prisma.homepageBanner.upsert({
      where: { id: banner.id },
      update: {
        title: banner.title,
        subtitle: banner.subtitle,
        imageUrl: banner.imageUrl,
        mobileImageUrl: banner.mobileImageUrl,
        linkType: banner.linkType,
        linkValue: banner.linkValue,
        buttonText: banner.buttonText,
        sort: banner.sort,
        status: 'active',
        startAt: startedAt,
        endAt: null,
      },
      create: {
        id: banner.id,
        title: banner.title,
        subtitle: banner.subtitle,
        imageUrl: banner.imageUrl,
        mobileImageUrl: banner.mobileImageUrl,
        linkType: banner.linkType,
        linkValue: banner.linkValue,
        buttonText: banner.buttonText,
        sort: banner.sort,
        status: 'active',
        startAt: startedAt,
      },
    });
  }

  const showcases = [
    {
      id: 1n,
      categoryId: 5n,
      name: '六色柔印设备',
      title: '食品饮料标签专用印刷线',
      description: '适合大批量卷标生产，支持防水、防油和耐摩擦工艺组合。',
      imageUrl: 'https://dummyimage.com/960x640/0f766e/ffffff&text=Flexo+Press',
      galleryJson: [
        'https://dummyimage.com/960x640/115e59/ffffff&text=Flexo+Press+1',
        'https://dummyimage.com/960x640/134e4a/ffffff&text=Flexo+Press+2',
      ],
      specsJson: {
        maxWidthMm: 330,
        maxSpeedPerMin: 120,
        supportedProcesses: ['覆膜', '模切', '冷烫'],
      },
      sort: 10,
    },
    {
      id: 2n,
      categoryId: 4n,
      name: '热敏标签模切机',
      title: '物流热敏标签高速模切设备',
      description: '适合快递面单、仓储标签等连续生产场景，支持高速走纸与自动收卷。',
      imageUrl: 'https://dummyimage.com/960x640/7c3aed/ffffff&text=Thermal+Die-Cut',
      galleryJson: [
        'https://dummyimage.com/960x640/6d28d9/ffffff&text=Thermal+Die-Cut+1',
      ],
      specsJson: {
        maxWidthMm: 220,
        maxSpeedPerMin: 180,
        supportedProcesses: ['模切', '分条'],
      },
      sort: 20,
    },
    {
      id: 3n,
      categoryId: 6n,
      name: '数码烫金组合机',
      title: '美妆标签高精度工艺设备',
      description: '适合高颜值标签的小批量柔性生产，支持局部 UV、烫金与异形工艺。',
      imageUrl: 'https://dummyimage.com/960x640/be123c/ffffff&text=Digital+Foil',
      galleryJson: [
        'https://dummyimage.com/960x640/9f1239/ffffff&text=Digital+Foil+1',
      ],
      specsJson: {
        maxWidthMm: 320,
        maxSpeedPerMin: 60,
        supportedProcesses: ['烫金', '局部UV', '异形模切'],
      },
      sort: 30,
    },
  ] as const;

  for (const showcase of showcases) {
    await prisma.categoryEquipmentShowcase.upsert({
      where: { id: showcase.id },
      update: {
        categoryId: showcase.categoryId,
        name: showcase.name,
        title: showcase.title,
        description: showcase.description,
        imageUrl: showcase.imageUrl,
        galleryJson: showcase.galleryJson,
        specsJson: showcase.specsJson,
        sort: showcase.sort,
        status: 'active',
      },
      create: {
        id: showcase.id,
        categoryId: showcase.categoryId,
        name: showcase.name,
        title: showcase.title,
        description: showcase.description,
        imageUrl: showcase.imageUrl,
        galleryJson: showcase.galleryJson,
        specsJson: showcase.specsJson,
        sort: showcase.sort,
        status: 'active',
      },
    });
  }
}

async function seedCategories() {
  const categories = [
    [1n, '铜版纸不干胶', 10],
    [2n, '透明膜标签', 20],
    [3n, '合成纸标签', 30],
    [4n, '热敏 / 物流标签', 40],
    [5n, '食品饮料标签', 50],
    [6n, '日化美妆标签', 60],
    [7n, '电子电器标签', 70],
    [8n, '医药保健标签', 80],
    [9n, '防伪 / 易碎标签', 90],
    [10n, '特殊工艺标签', 100],
    [11n, '包装封口标签', 110],
    [12n, '可移除标签', 120],
  ] as const;

  for (const [id, name, sort] of categories) {
    await prisma.productCategory.upsert({
      where: { id },
      update: { name, sort, status: 'active' },
      create: { id, name, sort },
    });
  }
}

async function seedProducts() {
  const products = [
    {
      id: 1n,
      categoryId: 2n,
      code: 'PET-LABEL',
      name: '透明膜标签',
      description: '透明膜不干胶标签，可选覆膜、模切、局部光油，耐撕耐水。',
      applicationScenario: '日化、化妆品、瓶身标签',
      coverImage: null,
      isHot: true,
      sort: 10,
    },
    {
      id: 2n,
      categoryId: 1n,
      code: 'COATED-LABEL',
      name: '铜版纸彩色标签',
      description: '铜版纸材质彩色印刷标签，性价比高，适合大批量使用。',
      applicationScenario: '食品包装、电商发货标签',
      coverImage: null,
      isHot: true,
      sort: 20,
    },
    {
      id: 3n,
      categoryId: 10n,
      code: 'HOT-STAMP-LABEL',
      name: '烫金工艺标签',
      description: '铜版纸/透明膜材质叠加烫金工艺，高端礼盒常用。',
      applicationScenario: '礼品、高端酒水、化妆品',
      coverImage: null,
      isHot: false,
      sort: 30,
    },
    {
      id: 4n,
      categoryId: 4n,
      code: 'THERMAL-LABEL',
      name: '热敏物流标签',
      description: '热敏材质物流标签，适合快递、仓储扫码打印。',
      applicationScenario: '电商仓储、快递物流',
      coverImage: null,
      isHot: false,
      sort: 40,
    },
    {
      id: 5n,
      categoryId: 3n,
      code: 'PVC-SYNTHETIC-LABEL',
      name: '合成纸耐候标签',
      description: '合成纸不干胶标签，耐水耐磨，适合户外和设备标识。',
      applicationScenario: '户外标识、设备贴、周转箱标签',
      coverImage: null,
      isHot: false,
      sort: 50,
    },
    {
      id: 6n,
      categoryId: 5n,
      code: 'FOOD-DRINK-LABEL',
      name: '食品饮料标签',
      description: '适合食品罐、饮料瓶、烘焙包装的彩色不干胶标签。',
      applicationScenario: '食品包装、饮料瓶贴、烘焙贴纸',
      coverImage: null,
      isHot: true,
      sort: 60,
    },
    {
      id: 7n,
      categoryId: 6n,
      code: 'COSMETIC-LABEL',
      name: '日化美妆标签',
      description: '支持透明、覆膜、烫金、局部光油等日化美妆常用工艺。',
      applicationScenario: '洗护瓶贴、精华瓶贴、彩妆包装',
      coverImage: null,
      isHot: true,
      sort: 70,
    },
    {
      id: 8n,
      categoryId: 7n,
      code: 'ELECTRONIC-NAMEPLATE',
      name: '电子电器铭牌标签',
      description: '透明膜/合成纸材质，适合电子产品铭牌、警示和资产标识。',
      applicationScenario: '电子铭牌、设备警示、资产管理',
      coverImage: null,
      isHot: false,
      sort: 80,
    },
    {
      id: 9n,
      categoryId: 8n,
      code: 'MEDICAL-HEALTH-LABEL',
      name: '医药保健标签',
      description: '适合药盒、保健品瓶身、说明标识等规范化标签场景。',
      applicationScenario: '药品包装、保健品瓶贴、说明标签',
      coverImage: null,
      isHot: false,
      sort: 90,
    },
    {
      id: 10n,
      categoryId: 9n,
      code: 'TAMPER-EVIDENT-LABEL',
      name: '防伪易碎标签',
      description: '易碎纸和防拆场景常用标签，适合质保、防伪和封签。',
      applicationScenario: '防伪封签、质保标签、一次性封口',
      coverImage: null,
      isHot: false,
      sort: 100,
    },
    {
      id: 11n,
      categoryId: 11n,
      code: 'SEALING-LABEL',
      name: '包装封口标签',
      description: '用于包装盒、外卖餐盒、礼盒封口的异形或矩形封签。',
      applicationScenario: '礼盒封口、外卖封签、包装盒贴',
      coverImage: null,
      isHot: false,
      sort: 110,
    },
    {
      id: 12n,
      categoryId: 12n,
      code: 'REMOVABLE-LABEL',
      name: '可移除标签',
      description: '可移除胶标签，适合临时标识、促销贴和不留胶场景。',
      applicationScenario: '临时标识、促销贴、玻璃贴',
      coverImage: null,
      isHot: false,
      sort: 120,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { code: product.code },
      update: {
        categoryId: product.categoryId,
        name: product.name,
        description: product.description,
        applicationScenario: product.applicationScenario,
        coverImage: product.coverImage ?? undefined,
        isHot: product.isHot,
        sort: product.sort,
        status: 'active',
      },
      create: product,
    });
  }
}

async function seedTemplates() {
  for (const spec of TEMPLATES) {
    const {
      id,
      productId,
      templateName,
      widthMin,
      widthMax,
      heightMin,
      heightMax,
      quantityMin,
      quantityMax,
      allowCustomShape,
      allowLamination,
      allowHotStamping,
      allowUv,
      allowDieCut,
      allowProofing,
      defaultLossRate,
      minPrice,
    } = spec;

    await prisma.productTemplate.upsert({
      where: { id },
      update: {
        productId,
        templateName,
        widthMin,
        widthMax,
        heightMin,
        heightMax,
        quantityMin,
        quantityMax,
        allowCustomShape: allowCustomShape ?? false,
        allowLamination: allowLamination ?? false,
        allowHotStamping: allowHotStamping ?? false,
        allowUv: allowUv ?? false,
        allowDieCut: allowDieCut ?? false,
        allowProofing: allowProofing ?? false,
        defaultLossRate,
        minPrice,
        status: 'active',
      },
      create: {
        id,
        productId,
        templateName,
        widthMin,
        widthMax,
        heightMin,
        heightMax,
        quantityMin,
        quantityMax,
        allowCustomShape: allowCustomShape ?? false,
        allowLamination: allowLamination ?? false,
        allowHotStamping: allowHotStamping ?? false,
        allowUv: allowUv ?? false,
        allowDieCut: allowDieCut ?? false,
        allowProofing: allowProofing ?? false,
        defaultLossRate,
        minPrice,
      },
    });

    const rows = [
      ...spec.materials.map(([value, label]) => ['material', value, label] as const),
      ...spec.processes.map(([value, label]) => ['process', value, label] as const),
      ...spec.printModes.map(([value, label]) => ['print_mode', value, label] as const),
      ...spec.shapes.map(([value, label]) => ['shape', value, label] as const),
    ];

    await prisma.productTemplateOption.deleteMany({ where: { templateId: id } });
    if (rows.length > 0) {
      await prisma.productTemplateOption.createMany({
        data: rows.map(([optionType, optionValue, optionLabel], index) => ({
          templateId: id,
          optionType,
          optionValue,
          optionLabel,
          sort: index + 1,
        })),
      });
    }
  }
}

async function seedMaterials() {
  const materials = [
    [1n, 'COATED-PAPER', '铜版纸', 'face', 0.8],
    [2n, 'PET-CLEAR', '透明膜', 'face', 1.5],
    [3n, 'LAMINATION-FILM', '覆膜材料', 'lamination', 0.25],
    [4n, 'THERMAL-PAPER', '热敏纸', 'face', 0.9],
    [5n, 'PVC-SYNTHETIC', '合成纸', 'face', 1.2],
    [6n, 'FRAGILE-SECURITY-PAPER', '易碎防伪纸', 'face', 1.8],
    [7n, 'REMOVABLE-COATED-PAPER', '可移除胶铜版纸', 'face', 1.1],
  ] as const;

  for (const [id, code, name, type, unitPrice] of materials) {
    await prisma.material.upsert({
      where: { code },
      update: { name, type, unit: 'm2' },
      create: { id, code, name, type, unit: 'm2' },
    });
    await prisma.materialPrice.updateMany({
      where: { materialId: id, isCurrent: true },
      data: { isCurrent: false },
    });
    await prisma.materialPrice.create({
      data: {
        materialId: id,
        priceType: 'calc',
        unitPrice,
        effectiveFrom: startedAt,
        isCurrent: true,
      },
    });
  }
}

async function seedProcesses() {
  const processes = [
    [1n, 'lamination', '覆膜', 'surface', 'per_area', 0.2, 0, 0],
    [2n, 'die_cut', '模切', 'cutting', 'fixed_plus_qty', 0.01, 80, 0],
    [3n, 'uv', '局部光油', 'surface', 'per_area', 0.3, 0, 0],
    [4n, 'proofing', '打样', 'proof', 'fixed', 100, 0, 0],
    [5n, 'hot_stamp', '烫金', 'surface', 'per_area', 1.2, 100, 50],
  ] as const;

  for (const [id, code, name, processType, feeMode, unitPrice, setupFee, minFee] of processes) {
    await prisma.process.upsert({
      where: { code },
      update: { name, processType, feeMode },
      create: { id, code, name, processType, feeMode },
    });
    await prisma.processPrice.updateMany({
      where: { processId: id, isCurrent: true },
      data: { isCurrent: false },
    });
    await prisma.processPrice.create({
      data: {
        processId: id,
        feeMode,
        unitPrice,
        setupFee,
        minFee,
        effectiveFrom: startedAt,
        isCurrent: true,
      },
    });
  }
}

async function seedPrintPrices() {
  await prisma.printPrice.updateMany({
    where: { isCurrent: true },
    data: { isCurrent: false },
  });
  await prisma.printPrice.createMany({
    data: [
      {
        printMode: 'four_color',
        feeMode: 'per_qty',
        unitPrice: 0.03,
        setupFee: 50,
        effectiveFrom: startedAt,
        isCurrent: true,
      },
      {
        printMode: 'single_color',
        feeMode: 'per_qty',
        unitPrice: 0.02,
        setupFee: 50,
        effectiveFrom: startedAt,
        isCurrent: true,
      },
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
      const versionNo = `RULE-T${spec.id}-${scene.toUpperCase()}-V1`;
      const name = `${spec.templateName}-${scene === 'enterprise' ? '企业' : '普通'}规则`;

      await prisma.quoteRuleSet.upsert({
        where: { id: ruleSetId },
        update: {
          productTemplateId: spec.id,
          name,
          scene,
          versionNo,
          status: 'active',
          priority: index + 1,
        },
        create: {
          id: ruleSetId,
          productTemplateId: spec.id,
          name,
          scene,
          versionNo,
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

async function seedAdminAccount() {
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
    create: { code: 'super_admin', name: '超级管理员', description: '拥有第一阶段后台全部操作权限' },
  });

  for (const [code] of permissions) {
    const permission = await prisma.adminPermission.findUniqueOrThrow({ where: { code } });
    await prisma.adminRolePermission.upsert({
      where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
      update: {},
      create: { roleId: role.id, permissionId: permission.id },
    });
  }

  const username = process.env.ADMIN_USERNAME ?? 'admin';
  const password = process.env.ADMIN_PASSWORD ?? 'admin123';
  const adminUser = await prisma.adminUser.upsert({
    where: { username },
    update: { displayName: '系统管理员', status: 'active' },
    create: {
      username,
      displayName: '系统管理员',
      passwordHash: hashPassword(password),
    },
  });

  await prisma.adminUserRole.upsert({
    where: { adminUserId_roleId: { adminUserId: adminUser.id, roleId: role.id } },
    update: {},
    create: { adminUserId: adminUser.id, roleId: role.id },
  });
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
      update: {
        name,
        discountRate,
        priority,
        remark,
      },
      create: {
        id,
        code,
        name,
        discountRate,
        priority,
        remark,
      },
    });
  }
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
