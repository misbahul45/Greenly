import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../../libs/database/database.service";
import { AddMemberDTO, UpdateMemberRoleDTO, type ShopMemberQueryDTO } from "./member.dto";
import { Prisma } from "../../../../generated/prisma/browser";

@Injectable()
export class MemberRepository {
  constructor(private readonly db: DatabaseService) {}

  async findMemberByShopIdAndUserId(shopId: string, userId: string) {
    return this.db.shopMember.findFirst({
      where: {
        userId,
        shopId,
        deletedAt: null,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                fullName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });
  }

  async findShopById(shopId: string) {
    return this.db.shop.findFirst({
      where: {
        id: shopId,
        deletedAt: null,
      },
    });
  }

  async addMember(shopId: string, body: AddMemberDTO) {
    return this.db.shopMember.create({
      data: {
        shopId,
        userId: body.userId,
        role: body.role,
      },
    });
  }

  async findMany(
    shopId: string,
    { page = 1, limit = 10, role, sortBy = "createdAt", sortOrder = "desc" }: ShopMemberQueryDTO,
  ) {
    const where: Prisma.ShopMemberWhereInput = {
      shopId,
      deletedAt: null,
      ...(role && { role }),
    };

    return this.db.shopMember.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                fullName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });
  }

  async count(shopId: string, { role }: ShopMemberQueryDTO) {
    const where: Prisma.ShopMemberWhereInput = {
      shopId,
      deletedAt: null,
      ...(role && { role }),
    };

    return this.db.shopMember.count({ where });
  }

  async updateMemberRole(shopId: string, memberId: string, body: UpdateMemberRoleDTO) {
    return this.db.shopMember.update({
      where: {
        shopId_userId: {
          shopId,
          userId: memberId,
        },
      },
      data: {
        role: body.role,
      },
    });
  }

  async deleteMember(shopId: string, memberId: string) {
    return this.db.shopMember.update({
      where: {
        shopId_userId: {
          shopId,
          userId: memberId,
        },
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}