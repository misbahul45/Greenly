import { Injectable } from '@nestjs/common';
import { OrderQueryDTO } from './order.dto';
import { OrderRepository } from './order.repository';
import { AppError } from '../../../libs/errors/app.error';
import { OrderStatus } from '../../../../generated/prisma/enums';

@Injectable()
export class OrderService {
  constructor(
    private readonly repo: OrderRepository,
  ) {}

  async findAll(shopId: number, query: OrderQueryDTO) {
    const {
      page,
      limit,
      status,
      createdFrom,
      createdTo,
      sortBy,
      sortOrder,
    } = query;

    const [orders, total] = await Promise.all([
      this.repo.findMany({
        shopId,
        skip: (page - 1) * limit,
        take: limit,
        status,
        createdFrom,
        createdTo,
        sortBy,
        sortOrder,
      }),
      this.repo.count({
        shopId,
        status,
        createdFrom,
        createdTo,
      }),
    ]);

    return {
      data: orders,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
      message: 'Orders fetched successfully',
    };
  }

  async findOne(shopId: number, orderId: number) {
    const order = await this.repo.findOne(shopId, orderId);

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    return {
      data: order,
      message: 'Order fetched successfully',
    };
  }

  async updateStatus(
    shopId: number,
    orderId: number,
    status: OrderStatus,
  ) {
    const order = await this.repo.findOne(shopId, orderId);

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    const updated = await this.repo.updateStatus(
      shopId,
      orderId,
      status,
    );

    return {
      data: updated,
      message: 'Order status updated successfully',
    };
  }

  async updateRefund(
    shopId: number,
    orderId: number,
    refundId: number,
  ) {
    const order = await this.repo.findOne(shopId, orderId);

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    const updated = await this.repo.updateRefund(
      refundId,
    );

    return {
      data: updated,
      message: 'Refund updated successfully',
    };
  }
}