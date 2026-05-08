import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../libs/database/database.service';
import { Prisma } from '../../../../generated/prisma/browser';
import { ListRefundsQueryDto } from './refund.dto';

@Injectable()
export class RefundRepository {
  constructor(private readonly db: DatabaseService) {}

  async findByFilters(filters: ListRefundsQueryDto, shopId?: string) {
    const where: Prisma.RefundWhereInput = {
      ...(shopId && { payment: { order: { shopId } } }),
      ...(filters.status && { status: filters.status as any }),
    };

    const skip = (filters.page - 1) * filters.limit;

    return this.db.$transaction([
      this.db.refund.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: filters.limit,
        skip,
        include: { payment: { include: { order: true } } },
      }),
      this.db.refund.count({ where }),
    ]);
  }

  async findById(id: string) {
    return this.db.refund.findUnique({
      where: { id },
      include: { payment: { include: { order: true } } },
    });
  }

  async create(data: Prisma.RefundUncheckedCreateInput) {
    return this.db.refund.create({
      data,
    });
  }

  async updateStatus(id: string, status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED', reason?: string) {
    return this.db.refund.update({
      where: { id },
      data: {
        status: status as any,
        ...(reason && { reason }),
      },
      include: { payment: { include: { order: true } } }
    });
  }
}
