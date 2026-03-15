import { Injectable } from '@nestjs/common';
import { OrderQueryDTO } from './order.dto';
import { OrderRepository } from './order.repository';
import { AppError } from '../../../libs/errors/app.error';
import { OrderStatus } from '../../../../generated/prisma/enums';

@Injectable()
export class OrderService {
  constructor(private readonly repo: OrderRepository) {}

  async findAll(shopId: string, query: OrderQueryDTO) {
    const {
      page,
      limit,
      status,
      createdFrom,
      createdTo,
      sortBy,
      sortOrder,
      search
    } = query;

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.repo.findMany({
        shopId,
        skip,
        take: limit,
        status,
        createdFrom,
        createdTo,
        sortBy,
        sortOrder,
        search
      }),
      this.repo.count({
        shopId,
        status,
        createdFrom,
        createdTo,
        search
      }),
    ]);

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
      message: 'Orders fetched successfully',
    };
  }

  async findOne(shopId: string, orderId: string) {
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
    shopId: string,
    orderId: string,
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
    shopId: string,
    orderId: string,
    refundId: string,
  ) {
    const order = await this.repo.findOne(shopId, orderId);

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    const updated = await this.repo.updateRefund(refundId);

    return {
      data: updated,
      message: 'Refund updated successfully',
    };
  }
}