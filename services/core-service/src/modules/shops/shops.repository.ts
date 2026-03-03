import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../libs/database/database.service";
import { ShopStatus } from "../../../generated/prisma/enums";
import { Prisma } from "../../../generated/prisma/browser";

@Injectable()
export class ShopsRepository {
  constructor(private readonly db: DatabaseService) {}

  private buildWhere(params: {
    search?: string;
    status?: ShopStatus;
    ownerId?: number;
    createdFrom?: Date;
    createdTo?: Date;
  }): Prisma.ShopWhereInput {
    const where: Prisma.ShopWhereInput = {
      deletedAt: null,
    };

    if (params.status) {
      where.status = params.status;
    }

    if (params.ownerId) {
      where.ownerId = params.ownerId;
    }

    if (params.search) {
      where.name = {
        contains: params.search,
      };
    }

    if (params.createdFrom || params.createdTo) {
      where.createdAt = {
        ...(params.createdFrom && { gte: params.createdFrom }),
        ...(params.createdTo && { lte: params.createdTo }),
      };
    }

    return where;
  }

  async getShops(params: {
    skip: number;
    take: number;
    search?: string;
    status?: ShopStatus;
    ownerId?: number;
    createdFrom?: Date;
    createdTo?: Date;
    sortBy: keyof Prisma.ShopOrderByWithRelationInput;
    sortOrder: "asc" | "desc";
  }) {
    const where = this.buildWhere(params);

    const data = await this.db.shop.findMany({
      skip: params.skip,
      take: params.take,
      where,
      include: {
        owner: {
          select: {
            email: true,
            profile: true,
          },
        },
      },
      orderBy: {
        [params.sortBy]: params.sortOrder,
      },
    });

    return data.map(({ owner, ...shop }) => ({
      ...shop,
      owner: {
        email: owner.email,
        fullName: owner.profile?.fullName,
        avatarUrl: owner.profile?.avatarUrl,
      },
    }));
  }

  async countShop(params: {
    search?: string;
    status?: ShopStatus;
    ownerId?: number;
    createdFrom?: Date;
    createdTo?: Date;
  }) {
    const where = this.buildWhere(params);
    return this.db.shop.count({ where });
  }

  async myShop(userId: number) {
    const data = await this.db.shop.findMany({
      where: {
        ownerId: userId,
        deletedAt: null,
      },
      include: {
        owner: {
          select: {
            email: true,
            profile: true,
          },
        },
      },
    });

    return data.map(({ owner, ...shop }) => ({
      ...shop,
      owner: {
        email: owner.email,
        fullName: owner.profile?.fullName,
        avatarUrl: owner.profile?.avatarUrl,
      },
    }));
  }

  async findOne(id: number) {
    const data = await this.db.shop.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        owner: {
          select: {
            email: true,
            profile: true,
          },
        },
      },
    });

    if (!data) return null;

    const { owner, ...shop } = data;

    return {
      ...shop,
      owner: {
        email: owner.email,
        fullName: owner.profile?.fullName,
        avatarUrl: owner.profile?.avatarUrl,
      },
    };
  }

  async findByNameAndOwner(
    shopName: string,
    userId: number
  ) {
    return this.db.shop.findFirst({
      where: {
        ownerId: userId,
        name: shopName,
        deletedAt: null,
      },
    });
  }

  async create(data: Prisma.ShopCreateInput) {
    return this.db.shop.create({
      data,
    });
  }

  async update(
    id: number,
    data: Prisma.ShopUpdateInput
  ) {
    return this.db.shop.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: number) {
    return this.db.shop.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}