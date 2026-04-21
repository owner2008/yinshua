import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateMemberAddressDto, UpsertMemberProfileDto } from './dto/member.dto';

@Injectable()
export class MembersService {
  constructor(private readonly prisma: PrismaService) {}

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
