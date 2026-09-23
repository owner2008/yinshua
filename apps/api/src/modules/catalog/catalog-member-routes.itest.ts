import '../../load-env';
import assert from 'node:assert/strict';
import { AddressInfo } from 'node:net';
import { after, before, describe, it } from 'node:test';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../database/prisma.service';
import { createAdminToken } from '../auth/admin-token';
import { createMemberToken } from '../auth/member-token';

type Category = { id: number; name: string; status: string };
type Product = { id: number; galleryJson: string[] };
type MemberAddress = { id: number; detail: string; isDefault: boolean };

const marker = `it-route-${process.pid}-${Date.now()}`;
const categoryIds: bigint[] = [];
const productIds: bigint[] = [];
const userIds: bigint[] = [];
let app: INestApplication;
let prisma: PrismaService;
let baseUrl: string;

describe('catalog and member address HTTP integration', () => {
  before(async () => {
    assert.ok(process.env.DATABASE_URL, 'DATABASE_URL is required for integration tests');
    (BigInt.prototype as BigInt & { toJSON: () => number | string }).toJSON = function () {
      const value = Number(this);
      return Number.isSafeInteger(value) ? value : this.toString();
    };

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
    await app.listen(0, '127.0.0.1');
    baseUrl = `http://127.0.0.1:${(app.getHttpServer().address() as AddressInfo).port}/api`;
    prisma = app.get(PrismaService);
  });

  after(async () => {
    try {
      if (prisma) {
        await prisma.operationLog.deleteMany({
          where: { module: 'product-category', targetId: { in: categoryIds } },
        });
        await prisma.product.deleteMany({ where: { id: { in: productIds } } });
        await prisma.productCategory.deleteMany({ where: { id: { in: categoryIds } } });
        await prisma.memberAddress.deleteMany({ where: { userId: { in: userIds } } });
        await prisma.user.deleteMany({ where: { id: { in: userIds } } });
      }
    } finally {
      await app?.close();
    }
  });

  it('protects category writes and filters public catalog records', async () => {
    const token = createAdminToken('integration-admin', ['admin:product']).token;
    const unauthorized = await api('/admin/product-categories', { method: 'POST', body: { name: marker } });
    assert.equal(unauthorized.status, 401);

    const created = await api<Category>('/admin/product-categories', {
      method: 'POST', token, body: { name: marker, sort: 3 },
    });
    assert.equal(created.status, 201);
    assert.equal(created.body.name, marker);
    categoryIds.push(BigInt(created.body.id));

    const invalidParent = await api(`/admin/product-categories/${created.body.id}`, {
      method: 'PUT', token, body: { parentId: created.body.id },
    });
    assert.equal(invalidParent.status, 400);

    const product = await prisma.product.create({
      data: {
        categoryId: BigInt(created.body.id),
        name: `${marker}-product`,
        code: marker,
        galleryJson: ['/uploads/a.png', '', 42],
        sort: -100,
        isHot: true,
      },
    });
    productIds.push(product.id);

    const categories = await api<Category[]>('/catalog/categories');
    assert.equal(categories.status, 200);
    assert.ok(categories.body.some((item) => item.id === created.body.id));

    const products = await api<Product[]>(`/catalog/products?categoryId=${created.body.id}`);
    assert.equal(products.status, 200);
    assert.equal(products.body.length, 1);
    assert.deepEqual(products.body[0].galleryJson, ['/uploads/a.png']);

    const detail = await api<Product>(`/catalog/products/${product.id}`);
    assert.equal(detail.status, 200);
    assert.equal(detail.body.id, Number(product.id));

    const home = await api<{ categories: Category[]; hotProducts: Product[] }>('/catalog/home');
    assert.equal(home.status, 200);
    assert.ok(home.body.categories.some((item) => item.id === created.body.id));
    assert.ok(home.body.hotProducts.some((item) => item.id === Number(product.id)));

    const disabledCategory = await api<Category>(`/admin/product-categories/${created.body.id}`, {
      method: 'PUT', token, body: { status: 'inactive' },
    });
    assert.equal(disabledCategory.status, 200);
    assert.equal(disabledCategory.body.status, 'inactive');
    const visibleCategories = await api<Category[]>('/catalog/categories');
    assert.ok(visibleCategories.body.every((item) => item.id !== created.body.id));

    await prisma.product.update({ where: { id: product.id }, data: { status: 'inactive' } });
    const visibleProducts = await api<Product[]>(`/catalog/products?categoryId=${created.body.id}`);
    assert.equal(visibleProducts.body.length, 0);
    assert.equal((await api(`/catalog/products/${product.id}`)).status, 404);
  });

  it('keeps member address updates and deletion scoped to the signed-in user', async () => {
    const firstUser = await prisma.user.create({ data: { wxOpenid: `${marker}-first` } });
    const secondUser = await prisma.user.create({ data: { wxOpenid: `${marker}-second` } });
    userIds.push(firstUser.id, secondUser.id);
    const firstToken = createMemberToken(firstUser).token;
    const secondToken = createMemberToken(secondUser).token;

    assert.equal((await api('/member/addresses')).status, 401);
    const addressData = {
      consignee: '测试收件人', mobile: '13800000000', province: '山东省', city: '青岛市', detail: '测试地址',
    };
    const first = await api<MemberAddress>('/member/addresses', {
      method: 'POST', token: firstToken, body: { ...addressData, isDefault: true },
    });
    const second = await api<MemberAddress>('/member/addresses', {
      method: 'POST', token: firstToken, body: { ...addressData, detail: '第二地址' },
    });
    assert.equal(first.status, 201);
    assert.equal(second.status, 201);

    const movedDefault = await api<MemberAddress>(`/member/addresses/${second.body.id}`, {
      method: 'PUT', token: firstToken, body: { isDefault: true, detail: '更新后的第二地址' },
    });
    assert.equal(movedDefault.status, 200);
    assert.equal(movedDefault.body.detail, '更新后的第二地址');
    const addresses = await api<MemberAddress[]>('/member/addresses', { token: firstToken });
    assert.deepEqual(addresses.body.map((item) => [item.id, item.isDefault]), [
      [second.body.id, true], [first.body.id, false],
    ]);

    assert.equal((await api(`/member/addresses/${second.body.id}`, {
      method: 'PUT', token: secondToken, body: { detail: '越权修改' },
    })).status, 404);
    assert.equal((await api(`/member/addresses/${second.body.id}`, {
      method: 'DELETE', token: secondToken,
    })).status, 404);
    assert.deepEqual((await api<MemberAddress[]>('/member/addresses', { token: secondToken })).body, []);

    const removed = await api<{ success: boolean }>(`/member/addresses/${second.body.id}`, {
      method: 'DELETE', token: firstToken,
    });
    assert.equal(removed.status, 200);
    assert.equal(removed.body.success, true);
    const remaining = await api<MemberAddress[]>('/member/addresses', { token: firstToken });
    assert.equal(remaining.body.length, 1);
    assert.equal(remaining.body[0].id, first.body.id);
    assert.equal(remaining.body[0].isDefault, true);
  });
});

async function api<T = unknown>(path: string, options: { method?: string; token?: string; body?: unknown } = {}) {
  const headers = new Headers();
  if (options.token) headers.set('Authorization', `Bearer ${options.token}`);
  if (options.body !== undefined) headers.set('Content-Type', 'application/json');
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  return { status: response.status, body: await response.json() as T };
}
