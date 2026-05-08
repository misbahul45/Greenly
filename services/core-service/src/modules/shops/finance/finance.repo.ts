import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../../libs/database/database.service";
import { Prisma } from "../../../../generated/prisma/browser";
import { Decimal } from "@prisma/client/runtime/index-browser";

@Injectable()
export class FinanceRepository {
  constructor(private readonly db: DatabaseService) {}

  async getBalance(shopId: string) {
    const result = await this.db.shopLedger.aggregate({
      where: { shopId },
      _sum: { amount: true },
    });

    return result._sum.amount?.toString() ?? "0";
  }

  async getPendingPayoutTotal(shopId: string) {
    const result = await this.db.payout.aggregate({
      where: { shopId, status: "PENDING" },
      _sum: { amount: true },
    });

    return result._sum.amount?.toString() ?? "0";
  }

  async findLedgerEntries(params: {
    shopId: string;
    skip: number;
    take: number;
    type?: string;
    search?: string;
    createdFrom?: Date;
    createdTo?: Date;
    sortBy: string;
    sortOrder: Prisma.SortOrder;
  }) {
    const { shopId, skip, take, type, search, createdFrom, createdTo, sortBy, sortOrder } = params;

    const where: Prisma.ShopLedgerWhereInput = {
      shopId,
      ...(type && { type: type as Prisma.EnumLedgerTypeFilter }),
      ...(search && {
        OR: [
          { reference: { contains: search } },
          { description: { contains: search } },
        ],
      }),
      ...((createdFrom || createdTo) && {
        createdAt: {
          ...(createdFrom && { gte: createdFrom }),
          ...(createdTo && { lte: createdTo }),
        },
      }),
    };

    const [data, total] = await this.db.$transaction([
      this.db.shopLedger.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.db.shopLedger.count({ where }),
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

  async createPayout(shopId: string, amount: number) {
    const decimalAmount = new Decimal(amount);

    return this.db.$transaction(
      async (tx) => {
        const balance = await tx.shopLedger.aggregate({
          where: { shopId },
          _sum: { amount: true },
        });

        const currentBalance = balance._sum.amount ?? new Decimal(0);

        if (currentBalance.lt(decimalAmount)) {
          throw new Error("INSUFFICIENT_BALANCE");
        }

        const payout = await tx.payout.create({
          data: {
            shopId,
            amount: decimalAmount,
            status: "PENDING",
          },
        });

        await tx.shopLedger.create({
          data: {
            shopId,
            type: "DEBIT",
            amount: decimalAmount.neg(),
            reference: `payout:${payout.id}`,
            description: "Payout request",
          },
        });

        return payout;
      },
      {
        maxWait: 5000,
        timeout: 10000,
      },
    );
  }

  async findPayouts(params: {
    shopId: string;
    skip: number;
    take: number;
    status?: string;
    createdFrom?: Date;
    createdTo?: Date;
    sortBy: string;
    sortOrder: Prisma.SortOrder;
  }) {
    const { shopId, skip, take, status, createdFrom, createdTo, sortBy, sortOrder } = params;

    const where: Prisma.PayoutWhereInput = {
      shopId,
      ...(status && { status: status as Prisma.EnumPayoutStatusFilter }),
      ...((createdFrom || createdTo) && {
        createdAt: {
          ...(createdFrom && { gte: createdFrom }),
          ...(createdTo && { lte: createdTo }),
        },
      }),
    };

    const [data, total] = await this.db.$transaction([
      this.db.payout.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.db.payout.count({ where }),
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
