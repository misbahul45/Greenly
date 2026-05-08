import { Injectable } from "@nestjs/common";
import { DashboardRepository } from "./dashboard.repository";
import { AppError } from "../../../libs/errors/app.error";

@Injectable()
export class DashboardService {
  constructor(private readonly repo: DashboardRepository) {}

  async getSummary(shopId: string): Promise<ApiResponse<unknown>> {
    const [orderStats, totalRevenue, currentBalance, pendingPayout, monthlyRevenue] =
      await Promise.all([
        this.repo.getOrderStats(shopId),
        this.repo.getTotalRevenue(shopId),
        this.repo.getBalance(shopId),
        this.repo.getPendingPayout(shopId),
        this.repo.getMonthlyRevenue(shopId),
      ]);

    return {
      data: {
        totalOrders: orderStats.totalOrders,
        completedOrders: orderStats.completedOrders,
        pendingOrders: orderStats.pendingOrders,
        processingOrders: orderStats.processingOrders,
        totalRevenue,
        currentBalance,
        pendingPayout,
        monthlyRevenue,
      },
      message: "Dashboard summary fetched successfully",
    };
  }

  async getRecentOrders(shopId: string, limit: number): Promise<ApiResponse<unknown[]>> {
    const safeLimit = Math.min(Math.max(limit, 1), 50);
    const orders = await this.repo.getRecentOrders(shopId, safeLimit);
    return {
      data: orders,
      message: "Recent orders fetched successfully",
    };
  }

  async getRevenue(shopId: string, range: string): Promise<ApiResponse<unknown>> {
    const daysMap: Record<string, number> = {
      "7d": 7,
      "30d": 30,
      "90d": 90,
    };

    const days = daysMap[range];

    if (!days) {
      throw new AppError("Invalid range. Use 7d, 30d, or 90d", 400);
    }

    const chart = await this.repo.getRevenueByRange(shopId, days);

    return {
      data: chart,
      message: "Revenue chart fetched successfully",
    };
  }
}
