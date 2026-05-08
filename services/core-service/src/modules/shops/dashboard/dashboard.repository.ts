import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../../libs/database/database.service";

@Injectable()
export class DashboardRepository {
  constructor(private readonly db: DatabaseService) {}

  async getOrderStats(shopId: string) {
    const [totalOrders, completedOrders, pendingOrders, processingOrders] =
      await this.db.$transaction([
        this.db.order.count({ where: { shopId } }),
        this.db.order.count({ where: { shopId, status: "COMPLETED" } }),
        this.db.order.count({ where: { shopId, status: "PENDING" } }),
        this.db.order.count({ where: { shopId, status: "PROCESSING" } }),
      ]);

    return { totalOrders, completedOrders, pendingOrders, processingOrders };
  }

  async getTotalRevenue(shopId: string) {
    const result = await this.db.payment.aggregate({
      where: {
        order: { shopId },
        status: "SUCCESS",
      },
      _sum: {
        netAmount: true,
      },
    });

    return result._sum.netAmount?.toString() ?? "0";
  }

  async getBalance(shopId: string) {
    const shop = await this.db.shop.findUnique({
      where: { id: shopId },
      select: { balance: true },
    });

    return shop?.balance?.toString() ?? "0";
  }

  async getPendingPayout(shopId: string) {
    const result = await this.db.payout.aggregate({
      where: {
        shopId,
        status: "PENDING",
      },
      _sum: {
        amount: true,
      },
    });

    return result._sum.amount?.toString() ?? "0";
  }

  async getRecentOrders(shopId: string, limit: number) {
    return this.db.order.findMany({
      where: { shopId },
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                fullName: true,
              },
            },
          },
        },
        payment: {
          select: {
            status: true,
            netAmount: true,
            method: true,
          },
        },
      },
    });
  }

  async getRevenueByRange(shopId: string, days: number) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const payments = await this.db.payment.findMany({
      where: {
        order: { shopId },
        status: "SUCCESS",
        paidAt: { gte: startDate },
      },
      select: {
        netAmount: true,
        paidAt: true,
      },
      orderBy: { paidAt: "asc" },
    });

    const dailyMap = new Map<string, number>();

    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      const key = d.toISOString().split("T")[0];
      dailyMap.set(key, 0);
    }

    for (const payment of payments) {
      if (payment.paidAt) {
        const key = payment.paidAt.toISOString().split("T")[0];
        const current = dailyMap.get(key) ?? 0;
        dailyMap.set(key, current + Number(payment.netAmount));
      }
    }

    const labels: string[] = [];
    const values: string[] = [];

    for (const [label, value] of dailyMap) {
      labels.push(label);
      values.push(value.toFixed(2));
    }

    return { labels, values };
  }

  async getMonthlyRevenue(shopId: string) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const result = await this.db.payment.aggregate({
      where: {
        order: { shopId },
        status: "SUCCESS",
        paidAt: { gte: startOfMonth },
      },
      _sum: {
        netAmount: true,
      },
    });

    return result._sum.netAmount?.toString() ?? "0";
  }
}
