import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  CreateMemberAddressDto,
  RegisterMemberDto,
  UpdateMemberAddressDto,
  UpsertMemberProfileDto,
} from './dto/member.dto';

@Injectable()
export class MembersService {
  constructor(private readonly prisma: PrismaService) {}

  async register(userId: number, dto: RegisterMemberDto) {
    await this.ensureUser(userId);
    const profile = await this.prisma.$transaction(async (tx) => {
      if (dto.mobile || dto.nickname) {
        await tx.user.update({
          where: { id: BigInt(userId) },
          data: {
            mobile: dto.mobile || undefined,
            nickname: dto.nickname || undefined,
            status: 'active',
          },
        });
      }

      return tx.memberProfile.upsert({
        where: { userId: BigInt(userId) },
        create: {
          userId: BigInt(userId),
          memberNo: createMemberNo(userId),
          customerType: dto.customerType ?? 'personal',
          companyName: dto.companyName,
          contactName: dto.contactName,
          taxNo: dto.taxNo,
          industry: dto.industry,
          source: dto.source ?? 'self_register',
          remark: dto.remark,
        },
        update: {
          customerType: dto.customerType,
          companyName: dto.companyName,
          contactName: dto.contactName,
          taxNo: dto.taxNo,
          industry: dto.industry,
          source: dto.source ?? undefined,
          remark: dto.remark,
        },
        include: { user: true, level: true },
      });
    });

    return profile;
  }

  async findProfile(userId: number) {
    await this.ensureUser(userId);
    const profile = await this.prisma.memberProfile.findUnique({
      where: { userId: BigInt(userId) },
      include: { user: true, level: true },
    });

    if (!profile) {
      throw new NotFoundException('会员资料不存在');
    }

    return profile;
  }

  async upsertProfile(dto: UpsertMemberProfileDto) {
    await this.ensureUser(dto.userId);
    return this.prisma.memberProfile.upsert({
      where: { userId: BigInt(dto.userId) },
      create: {
        userId: BigInt(dto.userId),
        memberNo: createMemberNo(dto.userId),
        customerType: dto.customerType ?? 'personal',
        companyName: dto.companyName,
        contactName: dto.contactName,
        taxNo: dto.taxNo,
        industry: dto.industry,
        remark: dto.remark,
      },
      update: {
        customerType: dto.customerType,
        companyName: dto.companyName,
        contactName: dto.contactName,
        taxNo: dto.taxNo,
        industry: dto.industry,
        remark: dto.remark,
      },
      include: { user: true, level: true },
    });
  }

  async findAddresses(userId: number) {
    await this.ensureUser(userId);
    return this.prisma.memberAddress.findMany({
      where: { userId: BigInt(userId) },
      orderBy: [{ isDefault: 'desc' }, { id: 'desc' }],
    });
  }

  async createAddress(dto: CreateMemberAddressDto) {
    await this.ensureUser(dto.userId);

    if (dto.isDefault) {
      await this.prisma.memberAddress.updateMany({
        where: { userId: BigInt(dto.userId), isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.memberAddress.create({
      data: {
        userId: BigInt(dto.userId),
        consignee: dto.consignee,
        mobile: dto.mobile,
        province: dto.province,
        city: dto.city,
        district: dto.district,
        detail: dto.detail,
        isDefault: dto.isDefault ?? false,
      },
    });
  }

  async updateAddress(userId: number, id: number, dto: UpdateMemberAddressDto) {
    await this.ensureUser(userId);
    const existing = await this.prisma.memberAddress.findUnique({
      where: { id: BigInt(id) },
    });
    if (!existing || existing.userId !== BigInt(userId)) {
      throw new NotFoundException('收货地址不存在');
    }

    if (dto.isDefault) {
      await this.prisma.memberAddress.updateMany({
        where: { userId: BigInt(userId), isDefault: true, NOT: { id: BigInt(id) } },
        data: { isDefault: false },
      });
    }

    return this.prisma.memberAddress.update({
      where: { id: BigInt(id) },
      data: {
        consignee: dto.consignee,
        mobile: dto.mobile,
        province: dto.province,
        city: dto.city,
        district: dto.district,
        detail: dto.detail,
        isDefault: dto.isDefault,
      },
    });
  }

  async setDefaultAddress(userId: number, id: number) {
    return this.updateAddress(userId, id, { isDefault: true });
  }

  async deleteAddress(userId: number, id: number) {
    await this.ensureUser(userId);
    const existing = await this.prisma.memberAddress.findUnique({
      where: { id: BigInt(id) },
    });
    if (!existing || existing.userId !== BigInt(userId)) {
      throw new NotFoundException('收货地址不存在');
    }
    await this.prisma.memberAddress.delete({ where: { id: BigInt(id) } });
    if (existing.isDefault) {
      const next = await this.prisma.memberAddress.findFirst({
        where: { userId: BigInt(userId) },
        orderBy: { id: 'desc' },
      });
      if (next) {
        await this.prisma.memberAddress.update({
          where: { id: next.id },
          data: { isDefault: true },
        });
      }
    }
    return { success: true };
  }

  async findQuotes(userId: number) {
    await this.ensureUser(userId);
    return this.prisma.quote.findMany({
      where: { userId: BigInt(userId) },
      orderBy: { createdAt: 'desc' },
      include: {
        product: true,
        template: true,
        material: true,
        snapshot: true,
      },
    });
  }

  async findQuote(userId: number, quoteNo: string) {
    await this.ensureUser(userId);
    const quote = await this.prisma.quote.findFirst({
      where: { userId: BigInt(userId), quoteNo },
      include: {
        product: true,
        template: true,
        material: true,
        snapshot: true,
      },
    });

    if (!quote) {
      throw new NotFoundException('报价单不存在');
    }

    return quote;
  }

  private async ensureUser(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: BigInt(userId) } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return user;
  }
}

function createMemberNo(userId: number) {
  return `M${String(userId).padStart(8, '0')}`;
}
