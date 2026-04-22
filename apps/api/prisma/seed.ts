import { PrismaClient } from '@prisma/client';
import { createHash, randomBytes } from 'node:crypto';

const prisma = new PrismaClient();
const startedAt = new Date('2026-04-21T00:00:00+08:00');

async function main() {
  await prisma.product.upsert({
    where: { code: 'PET-LABEL' },
    update: {},
    create: {
      id: 1n,
      name: '透明 PET 标签',
      code: 'PET-LABEL',
      description: '透明 PET 不干胶标签，可选覆膜、模切、UV。',
    },
  });

  await prisma.productTemplate.upsert({
    where: { id: 1n },
    update: {},
    create: {
      id: 1n,
      productId: 1n,
      templateName: '透明 PET 标准报价模板',
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
    },
  });

  await seedOptions();
  await seedMaterials();
  await seedProcesses();
  await seedPrintPrices();
  await seedRules();
  await seedAdminAccount();
}

async function seedOptions() {
  const options = [
    ['material', '1', '铜版纸'],
    ['material', '2', '透明 PET'],
    ['material', '3', '覆膜材料'],
    ['process', 'lamination', '覆膜'],
    ['process', 'die_cut', '模切'],
    ['process', 'uv', 'UV'],
    ['process', 'proofing', '打样'],
    ['print_mode', 'four_color', '四色印刷'],
    ['print_mode', 'single_color', '单色印刷'],
    ['shape', 'rectangle', '矩形'],
    ['shape', 'custom', '异形'],
  ] as const;

  await prisma.productTemplateOption.deleteMany({ where: { templateId: 1n } });
  await prisma.productTemplateOption.createMany({
    data: options.map(([optionType, optionValue, optionLabel], index) => ({
      templateId: 1n,
      optionType,
      optionValue,
      optionLabel,
      sort: index + 1,
    })),
  });
}

async function seedMaterials() {
  const materials = [
    [1n, 'COATED-PAPER', '铜版纸', 'face', 0.8],
    [2n, 'PET-CLEAR', '透明 PET', 'face', 1.5],
    [3n, 'LAMINATION-FILM', '覆膜材料', 'lamination', 0.25],
  ] as const;

  for (const [id, code, name, type, unitPrice] of materials) {
    await prisma.material.upsert({
      where: { code },
      update: { name, type, unit: 'm2' },
      create: { id, code, name, type, unit: 'm2' },
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
    [3n, 'uv', 'UV', 'surface', 'per_area', 0.3, 0, 0],
    [4n, 'proofing', '打样', 'proof', 'fixed', 100, 0, 0],
  ] as const;

  for (const [id, code, name, processType, feeMode, unitPrice, setupFee, minFee] of processes) {
    await prisma.process.upsert({
      where: { code },
      update: { name, processType, feeMode },
      create: { id, code, name, processType, feeMode },
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
  const rules = [
    [1n, '普通客户标准规则', 'retail', 'RULE-RETAIL-V1', 1],
    [2n, '企业客户标准规则', 'enterprise', 'RULE-COMPANY-V1', 0.95],
  ] as const;

  for (const [id, name, scene, versionNo, memberRate] of rules) {
    await prisma.quoteRuleSet.upsert({
      where: { id },
      update: { name, scene, versionNo },
      create: {
        id,
        productTemplateId: 1n,
        name,
        scene,
        priority: Number(id),
        versionNo,
        effectiveFrom: startedAt,
      },
    });
    await prisma.quoteRule.create({
      data: {
        ruleSetId: id,
        conditionJson: {
          quantityRange: [100, 100000],
          widthRange: [20, 500],
          heightRange: [20, 500],
          customerTypes: [scene === 'enterprise' ? 'company' : 'personal'],
        },
        configJson: {
          lossRate: 1.08,
          profitRate: 1.35,
          memberRate,
          minPrice: 300,
          packageFee: 20,
          urgentFeeRate: 0.15,
        },
      },
    });
  }
}

async function seedAdminAccount() {
  const permissions = [
    ['admin:product', '产品与模板管理', 'product'],
    ['admin:pricing', '材料、工艺与价格管理', 'pricing'],
    ['admin:quote-rule', '报价规则管理', 'quote-rule'],
    ['admin:quote', '报价单查看', 'quote'],
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
