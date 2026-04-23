import { Injectable } from "@nestjs/common";
import { DatabaseService } from "src/libs/database/database.service";
import { AddMemberDTO, UpdateMemberRoleDTO, type ShopMemberQueryDTO } from "./member.dto";
import { Prisma } from "generated/prisma/browser";

@Injectable()
export class MemberRepository {
  constructor(private readonly db: DatabaseService) {}

  async findMemberByShopIdAndUserId(shopId: string, userId: string) {
    return await this.db.shopMember.findFirst({
      where: {
        userId,
        shopId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,            
          },
          include: {
            profile:true
          }
        },
      }
    });
  }

  async findShopById(shopId: string) {
    return await this.db.shop.findUnique({
      where: {
        id: shopId,
      },
    });
  }

  async addMember(shopId: string, body: AddMemberDTO) {
    return await this.db.shopMember.create({
      data: {
        shopId,
        userId: body.userId,
        role: body.role,
      },
    });
  }

  async findMany(
    shopId: string,
    { page = 1, limit = 10, role, sortBy = "createdAt", sortOrder = "desc" }: ShopMemberQueryDTO
  ) {
    const where: Prisma.ShopMemberWhereInput = {
      shopId,
      ...(role && { role }),
    };

    return await this.db.shopMember.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        user: true,
      },
    });
  }

  async count(shopId: string, { role }: ShopMemberQueryDTO) {
    const where: Prisma.ShopMemberWhereInput = {
      shopId,
      ...(role && { role }),
    };

    return await this.db.shopMember.count({
      where,
    });
  }
  
  async updateMemberRole(shopId: string, memberId: string, body: UpdateMemberRoleDTO) {
    return await this.db.shopMember.update({
      where: {
        shopId_userId: {
          shopId: shopId,
          userId: memberId,
        },
      },
      data: {
        role: body.role,
      },
    });
  }
  
  async deleteMember(shopId: string, memberId: string) {
    return await this.db.shopMember.update({
      where: {
        shopId_userId: {
          shopId: shopId,
          userId: memberId,
        },
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}