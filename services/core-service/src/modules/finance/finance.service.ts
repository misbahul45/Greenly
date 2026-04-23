import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../libs/database/database.service';
import { FinanceOverviewQueryDto } from './finance.dto';

@Injectable()
export class FinanceService {
  constructor(private readonly db: DatabaseService) {}

  async getPlatformOverview(query: FinanceOverviewQueryDto) {
    const defaultDateFrom = query.dateFrom ? new Date(query.dateFrom) : new Date(0);
    const defaultDateTo = query.dateTo ? new Date(query.dateTo) : new Date();

    const dateFilter = {
      gte: defaultDateFrom,
      lte: defaultDateTo,
    };
    const shops = await this.db.shop.aggregate({
      _sum: { balance: true },
      where: { deletedAt: null },
    });

    const pendingPayouts = await this.db.payout.aggregate({
      _sum: { amount: true },
      _count: { id: true },
      where: { status: 'PENDING', createdAt: dateFilter },
    });

    const completedPayments = await this.db.payment.aggregate({
      _sum: {
        grossAmount: true,
        marketplaceFee: true,
        gatewayFee: true,
      },
      where: { status: 'SUCCESS', paidAt: dateFilter },
    });

    return {
      data: {
        totalShopBalance: shops._sum.balance || 0,
        pendingPayoutsCount: pendingPayouts._count.id || 0,
        pendingPayoutsVolume: pendingPayouts._sum.amount || 0,
        transactionVolume: completedPayments._sum.grossAmount || 0,
        feeRevenue: {
          marketplace: completedPayments._sum.marketplaceFee || 0,
          gateway: completedPayments._sum.gatewayFee || 0,
        },
      },
      message: 'Platform finance overview retrieved successfully',
    };
  }
}
