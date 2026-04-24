import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import {
  CreateAdminMemberDto,
  CreateMemberLevelDto,
  UpdateAdminMemberDto,
  UpdateMemberLevelDto,
} from '../dto/admin-member.dto';
import { AuditLogService } from './audit-log.service';

@Injectable()
export class AdminMembersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLogService,
  ) {}

  findMembers() {
    return this.prisma.user.findMany({
      orderBy: { id: 'desc' },
      include: {
        profile: { include: { level: true } },
        addresses: { orderBy: [{ isDefault: 'desc' }, { id: 'desc' }] },
        _count: { select: { quotes: true, addresses: true } },
      },
    });
  }

  async findMember(id: number) {
    const member = await this.prisma.user.findUnique({
      where: { id: BigInt(id) },
      include: {
        profile: { include: { level: true } },
        addresses: { orderBy: [{ isDefault: 'desc' }, { id: 'desc' }] },
        quotes: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });
    if (!member) {
      throw new NotFoundException('会员不存在');
    }
    return member;
  }

  async createMember(dto: CreateAdminMemberDto) {
    const member = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          wxOpenid: dto.wxOpenid || undefined,
          mobile: dto.mobile || undefined,
          nickname: dto.nickname || undefined,
          status: dto.status ?? 'active',
        },
      });

      await tx.memberProfile.create({
        data: profileCreateData(Number(user.id), dto),
      });

      return tx.user.findUniqueOrThrow({
        where: { id: user.id },
        include: { profile: { include: { level: true } }, addresses: true },
      });
    });

    await this.audit.record({
      module: 'member',
      action: 'create',
      targetType: 'member',
      targetId: member.id,
      after: member,
    });
    return member;
  }

  async updateMember(id: number, dto: UpdateAdminMemberDto) {
    const before = await this.findMember(id);
    const after = await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: BigInt(id) },
        data: {
          wxOpenid: dto.wxOpenid,
          mobile: dto.mobile,
          nickname: dto.nickname,
          status: dto.status,
        },
      });

      await tx.memberProfile.upsert({
        where: { userId: BigInt(id) },
        create: profileCreateData(id, dto),
        update: profileUpdateData(dto),
      });

      return tx.user.findUniqueOrThrow({
        where: { id: BigInt(id) },
        include: { profile: { include: { level: true } }, addresses: true },
      });
    });

    await this.audit.record({
      module: 'member',
      action: 'update',
      targetType: 'member',
      targetId: after.id,
      before,
      after,
    });
    return after;
  }

  findLevels() {
    return this.prisma.memberLevel.findMany({ orderBy: [{ priority: 'desc' }, { id: 'asc' }] });
  }

  async createLevel(dto: CreateMemberLevelDto) {
    const level = await this.prisma.memberLevel.create({
      data: {
        name: dto.name,
        code: dto.code,
        discountRate: new Prisma.Decimal(dto.discountRate ?? 1),
        priority: dto.priority ?? 0,
        remark: dto.remark,
      },
    });
    await this.audit.record({
      module: 'member-level',
      action: 'create',
      targetType: 'member_level',
      targetId: level.id,
      after: level,
    });
    return level;
  }

  async updateLevel(id: number, dto: UpdateMemberLevelDto) {
    const before = await this.prisma.memberLevel.findUnique({ where: { id: BigInt(id) } });
    if (!before) {
      throw new NotFoundException('会员等级不存在');
    }
    const after = await this.prisma.memberLevel.update({
      where: { id: BigInt(id) },
      data: {
        name: dto.name,
        discountRate: dto.discountRate === undefined ? undefined : new Prisma.Decimal(dto.discountRate),
        priority: dto.priority,
        remark: dto.remark,
      },
    });
    await this.audit.record({
      module: 'member-level',
      action: 'update',
      targetType: 'member_level',
      targetId: after.id,
      before,
      after,
    });
    return after;
  }
}

function profileCreateData(userId: number, dto: CreateAdminMemberDto): Prisma.MemberProfileUncheckedCreateInput {
  return {
    userId: BigInt(userId),
    memberNo: createMemberNo(userId),
    customerType: dto.customerType ?? 'personal',
    companyName: dto.companyName,
    contactName: dto.contactName,
    taxNo: dto.taxNo,
    industry: dto.industry,
    source: dto.source ?? 'admin',
    levelId: normalizeLevelId(dto.levelId),
    remark: dto.remark,
  };
}

function profileUpdateData(dto: UpdateAdminMemberDto): Prisma.MemberProfileUncheckedUpdateInput {
  return {
    customerType: dto.customerType,
    companyName: dto.companyName,
    contactName: dto.contactName,
    taxNo: dto.taxNo,
    industry: dto.industry,
    source: dto.source,
    levelId: dto.levelId === undefined ? undefined : normalizeLevelId(dto.levelId),
    remark: dto.remark,
  };
}

function normalizeLevelId(levelId: number | undefined): bigint | null | undefined {
  if (levelId === undefined) {
    return undefined;
  }
  if (!Number.isFinite(levelId) || levelId <= 0) {
    return null;
  }
  return BigInt(levelId);
}

function createMemberNo(userId: number) {
  if (!Number.isFinite(userId) || userId <= 0) {
    throw new BadRequestException('会员 ID 无效');
  }
  return `M${String(userId).padStart(8, '0')}`;
}
