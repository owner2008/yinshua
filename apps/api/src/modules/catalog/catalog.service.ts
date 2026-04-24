import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  findCategories() {
    return this.prisma.productCategory.findMany({
      where: { status: 'active' },
      orderBy: [{ sort: 'asc' }, { id: 'asc' }],
    });
  }

  findProducts(categoryId?: number) {
    return this.prisma.product.findMany({
      where: {
        status: 'active',
        ...(categoryId ? { categoryId: BigInt(categoryId) } : {}),
      },
      orderBy: [{ sort: 'asc' }, { id: 'desc' }],
      include: { category: true },
    }).then((products) => products.map(normalizeProduct));
  }

  async findProduct(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: BigInt(id) },
      include: {
        category: true,
        templates: {
          where: { status: 'active' },
          include: { options: true },
          orderBy: { id: 'asc' },
        },
      },
    });
    if (!product || product.status !== 'active') {
      throw new NotFoundException('产品不存在');
    }
    return normalizeProduct(product);
  }

  async findHome() {
    const [categories, hotProducts, latestProducts] = await Promise.all([
      this.findCategories(),
      this.prisma.product.findMany({
        where: { status: 'active', isHot: true },
        orderBy: [{ sort: 'asc' }, { id: 'desc' }],
        take: 6,
      }),
      this.prisma.product.findMany({
        where: { status: 'active' },
        orderBy: [{ sort: 'asc' }, { id: 'desc' }],
        take: 8,
      }),
    ]);
    return {
      categories,
      hotProducts: (hotProducts.length > 0 ? hotProducts : latestProducts.slice(0, 4)).map(normalizeProduct),
      latestProducts: latestProducts.map(normalizeProduct),
    };
  }
}

function normalizeProduct<T extends { galleryJson: unknown }>(product: T) {
  const galleryJson = Array.isArray(product.galleryJson)
    ? product.galleryJson.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    : [];
  return {
    ...product,
    galleryJson,
  };
}
