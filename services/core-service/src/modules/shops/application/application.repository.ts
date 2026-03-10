import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../../libs/database/database.service";
import { ApplicationStatus, Prisma } from "../../../../generated/prisma/browser";

@Injectable()
export class ApplicationRepository {
  constructor(private readonly db: DatabaseService) {}

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
      data,
      include: {
        shop: true,
      },
    });

    if (data.status === "APPROVED") {
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
              role: "OWNER",
            },
          });
        }
      });
    }

    return shopApplication;
  }

  async findShopApplicationByShopId(shopId: number) {
    return this.db.shopApplication.findUnique({
      where: { shopId },
      include: {
        shop: true,
      },
    });
  }

  private buildWhere(params: {
    status?: ApplicationStatus;
    shopId?: number;
    createdFrom?: Date;
    createdTo?: Date;
    search?: string;
  }): Prisma.ShopApplicationWhereInput {
    const { status, shopId, createdFrom, createdTo, search } = params;

    return {
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

      ...(search
        ? {
            OR: [
              { bankName: { contains: search } },
              { accountName: { contains: search } },
              { nib: { contains: search } },
              { npwp: { contains: search } },
              {
                shop: {
                  name: { contains: search },
                },
              },
              {
                shop: {
                  owner: {
                    email: { contains: search },
                  },
                },
              },
            ],
          }
        : {}),
    };
  }

  async findMany(params: {
    skip: number;
    take: number;
    status?: ApplicationStatus;
    shopId?: number;
    createdFrom?: Date;
    createdTo?: Date;
    search?: string;
    sortBy: "createdAt" | "updatedAt" | "status";
    sortOrder: Prisma.SortOrder;
  }) {
    const { skip, take, sortBy, sortOrder, ...filters } = params;

    const where = this.buildWhere(filters);

    return this.db.shopApplication.findMany({
      skip,
      take,
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        shop: {
          include: {
            owner: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async count(params: {
    status?: ApplicationStatus;
    shopId?: number;
    createdFrom?: Date;
    createdTo?: Date;
    search?: string;
  }) {
    const where = this.buildWhere(params);

    return this.db.shopApplication.count({
      where,
    });
  }

  async findAll(params: {
    skip: number;
    take: number;
    status?: ApplicationStatus;
    shopId?: number;
    createdFrom?: Date;
    createdTo?: Date;
    search?: string;
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
        lastPage: Math.ceil(total / take),
      },
    };
  }

  async findMyApplications(
    userId: number,
    params: {
      skip: number;
      take: number;
      search?: string;
      sortBy: "createdAt" | "updatedAt" | "status";
      sortOrder: Prisma.SortOrder;
    }
  ) {
    const { skip, take, search, sortBy, sortOrder } = params;
  
    const where: Prisma.ShopApplicationWhereInput = {
      shop: {
        ownerId: userId,
      },
      ...(search && {
        OR: [
          { bankName: { contains: search } },
          { accountName: { contains: search } },
          { nib: { contains: search } },
          { npwp: { contains: search } },
          {
            shop: {
              name: { contains: search },
            },
          },
        ],
      }),
    };
  
    const [data, total] = await this.db.$transaction([
      this.db.shopApplication.findMany({
        skip,
        take,
        where,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          shop: true,
        },
      }),
      this.db.shopApplication.count({ where }),
    ]);
  
    return {
      data,
      meta: {
        total,
        limit: take,
        page: Math.floor(skip / take) + 1,
        lastPage: Math.ceil(total / take),
      },
    };
  }

  async deleteApplicationById(id:number){
    return await this.db.shopApplication.delete({
        where:{
            id
        }
    })
  }
}