import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../../libs/database/database.service";
import { OrderStatus } from "../../../../generated/prisma/enums";
import { Prisma } from "../../../../generated/prisma/browser";

@Injectable()
export class OrderRepository {
  constructor(private readonly db: DatabaseService) {}

  private buildWhere(params: {
    shopId: string;
    status?: OrderStatus;
    createdFrom?: Date;
    createdTo?: Date;
    search?: string;
  }): Prisma.OrderWhereInput {
    const { shopId, status, createdFrom, createdTo, search } = params;

    return {
      shopId,
      ...(status && { status }),
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
              {
                shopName: {
                  contains: search,
                },
              },
              {
                user: {
                  email: {
                    contains: search,
                  },
                },
              },
              {
                items: {
                  some: {
                    productName: {
                      contains: search,
                    },
                  },
                },
              },
              {
                payment: {
                  transactionId: {
                    contains: search,
                  },
                },
              },
            ],
          }
        : {}),
    };
  }

  async findMany(params: {
    shopId: string;
    skip: number;
    take: number;
    status?: OrderStatus;
    createdFrom?: Date;
    createdTo?: Date;
    search?: string;
    sortBy: "createdAt" | "totalAmount" | "status";
    sortOrder: Prisma.SortOrder;
  }) {
    const { skip, take, sortBy, sortOrder, ...filters } = params;

    const where = this.buildWhere(filters);

    return this.db.order.findMany({
      where,
      skip,
      take,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        items: true,
        user: true,
        payment: {
          include: {
            refunds: true,
          },
        },
      },
    });
  }

  async count(params: {
    shopId: string;
    status?: OrderStatus;
    createdFrom?: Date;
    createdTo?: Date;
    search?: string;
  }) {
    const where = this.buildWhere(params);

    return this.db.order.count({
      where,
    });
  }

  async findOne(shopId: string, orderId: string) {
    return this.db.order.findFirst({
      where: {
        id: orderId,
        shopId,
      },
      include: {
        items: true,
        user: true,
        payment: {
          include: {
            refunds: true,
          },
        },
      },
    });
  }

  async updateStatus(
    shopId: string,
    orderId: string,
    status: OrderStatus
  ) {
    return this.db.order.update({
      where: {
        id: orderId,
        shopId,
      },
      data: {
        status,
      },
    });
  }

  async updateRefund(refundId: string) {
    return this.db.refund.update({
      where: {
        id: refundId,
      },
      data: {
        status: "APPROVED",
      },
    });
  }
}