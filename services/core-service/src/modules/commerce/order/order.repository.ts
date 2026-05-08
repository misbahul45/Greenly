import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../libs/database/database.service';
import { Prisma } from '../../../../generated/prisma/browser';

@Injectable()
export class OrderRepository {
  constructor(private readonly db: DatabaseService) {}

  async findByUser(
    userId: string,
    params: {
      skip: number;
      take: number;
      status?: string;
    },
  ) {
    const where: Prisma.OrderWhereInput = {
      userId,
      ...(params.status && { status: params.status as any }),
    };

    const [data, total] = await this.db.$transaction([
      this.db.order.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          payment: true,
        },
      }),
      this.db.order.count({ where }),
    ]);

    return { data, total };
  }

  async findByShop(
    shopId: string,
    params: {
      skip: number;
      take: number;
      status?: string;
    },
  ) {
    const where: Prisma.OrderWhereInput = {
      shopId,
      ...(params.status && { status: params.status as any }),
    };

    const [data, total] = await this.db.$transaction([
      this.db.order.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          payment: true,
        },
      }),
      this.db.order.count({ where }),
    ]);

    return { data, total };
  }

  async findById(orderId: string) {
    return this.db.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        payment: {
          include: {
            refunds: true,
          },
        },
      },
    });
  }

  async updateStatus(orderId: string, status: string) {
    return this.db.order.update({
      where: { id: orderId },
      data: { status: status as any },
    });
  }
}
