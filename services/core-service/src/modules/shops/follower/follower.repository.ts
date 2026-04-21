import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../../libs/database/database.service";
import { Prisma } from "../../../../generated/prisma/browser";

@Injectable()
export class FollowerRepository {
  constructor(private readonly db: DatabaseService) {}

  async findFollowers(
    shopId: string,
    params: {
      skip: number;
      take: number;
      search?: string;
      sortBy: string;
      sortOrder: Prisma.SortOrder;
    },
  ) {
    const { skip, take, search, sortBy, sortOrder } = params;

    const where: Prisma.ShopFollowerWhereInput = {
      shopId,
      shop: { deletedAt: null },
      ...(search && {
        user: {
          OR: [
            { email: { contains: search } },
            { profile: { fullName: { contains: search } } },
          ],
        },
      }),
    };

    const [data, total] = await this.db.$transaction([
      this.db.shopFollower.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
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
      }),
      this.db.shopFollower.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page: Math.floor(skip / take) + 1,
        limit: take,
        lastPage: Math.ceil(total / take),
      },
    };
  }

  async findFollowingShops(
    userId: string,
    params: {
      skip: number;
      take: number;
      sortBy: string;
      sortOrder: Prisma.SortOrder;
    },
  ) {
    const { skip, take, sortBy, sortOrder } = params;

    const where: Prisma.ShopFollowerWhereInput = {
      userId,
      shop: { deletedAt: null },
    };

    const [data, total] = await this.db.$transaction([
      this.db.shopFollower.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          shop: {
            select: {
              id: true,
              name: true,
              description: true,
              status: true,
              followerCount: true,
            },
          },
        },
      }),
      this.db.shopFollower.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page: Math.floor(skip / take) + 1,
        limit: take,
        lastPage: Math.ceil(total / take),
      },
    };
  }
}
