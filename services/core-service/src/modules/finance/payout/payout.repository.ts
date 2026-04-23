import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../libs/database/database.service';
import { Prisma } from '../../../../generated/prisma/browser';
import { ListPayoutsQueryDto } from './payout.dto';

@Injectable()
export class PayoutRepository {
  constructor(private readonly db: DatabaseService) {}

  async findByShopId(shopId: string, filters: ListPayoutsQueryDto) {
    const where: Prisma.PayoutWhereInput = {
      shopId,
      ...(filters.status && { status: filters.status as any }),
    };

    const skip = (filters.page - 1) * filters.limit;

    return this.db.$transaction([
      this.db.payout.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: filters.limit,
        skip,
      }),
      this.db.payout.count({ where }),
    ]);
  }

  async findById(id: string) {
    return this.db.payout.findUnique({
      where: { id },
    });
  }

  async updateStatus(
    id: string,
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED',
    paidAt?: Date,
  ) {
    return this.db.payout.update({
      where: { id },
      data: {
        status: status as any,
        ...(paidAt && { paidAt }),
      },
    });
  }
}
