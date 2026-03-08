import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../../libs/database/database.service";
import { ApplicationStatus, Prisma } from "../../../../generated/prisma/browser";

@Injectable()
export class ApplicationRepository {
  constructor(
    private readonly db: DatabaseService
  ) {}

  async create(data: Prisma.ShopApplicationUncheckedCreateInput) {
    return this.db.shopApplication.create({
      data,
    });
  }

  async updateByShopId(
    shopId: number,
    data: Prisma.ShopApplicationUncheckedUpdateInput
  ) {
    const shopApplication = await this.db.shopApplication.update({
      where: { shopId },
      data:{
        ...data,
      },
      include:{
        shop:true
      }
    });

    if(data.status === 'APPROVED'){
        await this.db.$transaction(async (tx) => {
            const existingMember = await tx.shopMember.findUnique({
                where: {
                shopId_userId: {
                    shopId: shopId,
                    userId: shopApplication.shop.ownerId,
                },
                },
            });

            if (!existingMember) {
                await tx.shopMember.create({
                data: {
                    shopId: shopId,
                    userId: shopApplication.shop.ownerId,
                    role: 'OWNER',
                },
                });
            }
        });
    }
  }

  async findShopApplicationByShopId(shopId: number) {
    return this.db.shopApplication.findUnique({
      where: { shopId },
    });
  }

  async findMany(params: {
    skip: number;
    take: number;
    status?: ApplicationStatus;
    shopId?: number;
    createdFrom?: Date;
    createdTo?: Date;
    sortBy: "createdAt" | "updatedAt" | "status";
    sortOrder: Prisma.SortOrder;
    }) {
        const {
            skip,
            take,
            status,
            shopId,
            createdFrom,
            createdTo,
            sortBy,
            sortOrder,
        } = params;

        const where: Prisma.ShopApplicationWhereInput = {
            ...(status && { status }),
            ...(shopId && { shopId }),
            ...(createdFrom || createdTo
            ? {
                createdAt: {
                    ...(createdFrom && { gte: createdFrom }),
                    ...(createdTo && { lte: createdTo }),
                },
                }
            : {}),
        };

        return this.db.shopApplication.findMany({
            skip,
            take,
            where,
            orderBy: {
            [sortBy]: sortOrder,
            },
        });
    }

    async count(params: {
        status?: ApplicationStatus;
        shopId?: number;
        createdFrom?: Date;
        createdTo?: Date;
    }) {
        const { status, shopId, createdFrom, createdTo } = params;

        const where: Prisma.ShopApplicationWhereInput = {
            ...(status && { status }),
            ...(shopId && { shopId }),
            ...(createdFrom || createdTo
            ? {
                createdAt: {
                    ...(createdFrom && { gte: createdFrom }),
                    ...(createdTo && { lte: createdTo }),
                },
                }
            : {}),
        };

        return this.db.shopApplication.count({ where });
    }

    async findAll(params: {
        skip: number;
        take: number;
        status?: ApplicationStatus;
        shopId?: number;
        createdFrom?: Date;
        createdTo?: Date;
        sortBy: "createdAt" | "updatedAt" | "status";
        sortOrder: Prisma.SortOrder;
    }) {
        const { skip, take, ...filters } = params;

        const data = await this.findMany(params);
        const total = await this.count(filters);

        return {
            data,
            meta: {
              total,
              limit: take,
              page: Math.floor(skip / take) + 1,
              totalPage: Math.ceil(total / take),
            },
          };
        }

    async findMyApplications(userId: number) {
        return this.db.shopApplication.findMany({
            where: {
                shop: {
                    ownerId: userId,
                },
            },
            include: {
                shop: true,
            },
        });
    }
}