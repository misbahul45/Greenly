import { Injectable } from '@nestjs/common';
import { OrderQueryDTO } from './order.dto';
import { OrderRepository } from './order.repository';
import { ShopNotFoundError, InvalidStateTransitionError } from '../../../libs/errors/domain.error';
import { ShopOrderPublisher } from '../publisher/shop.order.publisher';
import { DatabaseService } from '../../../libs/database/database.service';
import * as crypto from 'crypto';
import { AppError } from '../../../libs/errors/app.error';

const STATUS_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['PAID', 'CANCELLED'],
  PAID: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [], 
  CANCELLED: [], 
};

@Injectable()
export class OrderService {
  constructor(
    private readonly repo: OrderRepository,
    private readonly publisher: ShopOrderPublisher,
    private readonly db: DatabaseService,
  ) {}

  async findAll(shopId: string, query: OrderQueryDTO) {
    const { page, limit, status, createdFrom, createdTo, sortBy, sortOrder, search } = query;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.repo.findMany({
        shopId, skip, take: limit, status, createdFrom, createdTo, sortBy, sortOrder, search
      }),
      this.repo.count({
        shopId, status, createdFrom, createdTo, search
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
    if (!order) throw new AppError('Order not found', 404);

    return {
      data: order,
      message: 'Order fetched successfully',
    };
  }

  async updateOrderStatus(shopId: string, orderId: string, newStatus: string) {
    return this.db.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { payment: true, items: true },
      });
      
      if (!order || order.shopId !== shopId) {
        throw new AppError('Order not found', 404);
      }

      const validNext = STATUS_TRANSITIONS[order.status];
      if (!validNext || !validNext.includes(newStatus)) {
        throw new InvalidStateTransitionError(order.status, newStatus);
      }

      let updatedOrder;

      // Completion Logic with Ledger Update
      if (newStatus === 'COMPLETED') {
         updatedOrder = await tx.order.update({
           where: { id: orderId },
           data: { status: 'COMPLETED' }
         });

         if (order.payment) {
           await tx.shopLedger.create({
             data: {
               shopId: order.shopId,
               type: 'CREDIT',
               amount: order.payment.netAmount,
               reference: `order_completed:${orderId}`,
               description: `Revenue from order ${orderId}`,
             }
           });

           await tx.shop.update({
             where: { id: order.shopId },
             data: { balance: { increment: order.payment.netAmount } }
           });
         }
      } else {
         updatedOrder = await tx.order.update({
           where: { id: orderId },
           data: { status: newStatus as any }
         });
      }

      await this.publisher.publishShopOrderStatusChanged({
        orderId,
        shopId,
        previousStatus: order.status,
        newStatus,
        timestamp: new Date().toISOString(),
        correlationId: crypto.randomUUID(),
      });

      return {
        data: updatedOrder,
        message: `Order status updated to ${newStatus}`,
      };
    }, {
       timeout: 10000,
       isolationLevel: 'ReadCommitted',
    });
  }

  async updateRefund(shopId: string, orderId: string, refundId: string) {
    return this.db.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id: orderId, shopId },
      });
      if (!order) throw new AppError('Order not found', 404);

      if (order.status !== 'PAID' && order.status !== 'PROCESSING') {
         throw new AppError('Refund can only be approved for PAID or PROCESSING orders', 400);
      }

      const updatedRefund = await tx.refund.update({
        where: { id: refundId },
        data: { status: 'APPROVED' },
      });

      await this.publisher.publishRefundProcessed({
        refundId,
        orderId,
        amount: updatedRefund.amount.toString(),
        status: 'APPROVED',
        timestamp: new Date().toISOString(),
      });

      return {
        data: updatedRefund,
        message: 'Refund approved successfully',
      };
    });
  }
}