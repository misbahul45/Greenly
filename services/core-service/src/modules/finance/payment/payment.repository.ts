import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../libs/database/database.service';
import { Prisma } from '../../../../generated/prisma/browser';
import { ListPaymentsQueryDto } from './payment.dto';

@Injectable()
export class PaymentRepository {
  constructor(private readonly db: DatabaseService) {}

  async findByShopIdAndFilters(shopId: string | undefined, filters: ListPaymentsQueryDto) {
    const where: Prisma.PaymentWhereInput = {
      ...(shopId && { order: { shopId } }),
      ...(filters.status && { status: filters.status as any }),
    };

    const skip = (filters.page - 1) * filters.limit;

    return this.db.$transaction([
      this.db.payment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: filters.limit,
        skip,
        include: { order: true },
      }),
      this.db.payment.count({ where }),
    ]);
  }

  async findById(id: string) {
    return this.db.payment.findUnique({
      where: { id },
      include: { order: true },
    });
  }

  async updateStatus(
    id: string,
    status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED',
    transactionId?: string,
    paidAt?: Date,
  ) {
    return this.db.payment.update({
      where: { id },
      data: {
        status: status as any,
        ...(transactionId && { transactionId }),
        ...(paidAt && { paidAt }),
      },
      include: { order: true },
    });
  }
}
