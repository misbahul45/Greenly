import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../../libs/database/database.service";
import { OrderStatus } from "../../../../generated/prisma/enums";
import { Prisma } from "../../../../generated/prisma/browser";

@Injectable()
export class OrderRepository {
  constructor(
    private readonly db: DatabaseService,
  ) {}

  async findMany(params: {
    shopId: number;
    skip: number;
    take: number;
    status?: OrderStatus;
    createdFrom?: Date;
    createdTo?: Date;
    sortBy: "createdAt" | "totalAmount" | "status";
    sortOrder: Prisma.SortOrder;
  }) {
    const {
      shopId,
      skip,
      take,
      status,
      createdFrom,
      createdTo,
      sortBy,
      sortOrder,
    } = params;

    return this.db.order.findMany({
      where: {
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
      },
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
    shopId: number;
    status?: OrderStatus;
    createdFrom?: Date;
    createdTo?: Date;
  }) {
    const { shopId, status, createdFrom, createdTo } = params;

    return this.db.order.count({
      where: {
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
      },
    });
  }

  async findOne(shopId: number, orderId: number) {
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
    shopId: number,
    orderId: number,
    status: OrderStatus,
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

  async updateRefund(
    refundId: number,
  ) {
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