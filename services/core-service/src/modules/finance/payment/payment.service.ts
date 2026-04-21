import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../libs/database/database.service';
import { PaymentRepository } from './payment.repository';
import { PaymentCompletedPublisher, PaymentFailedPublisher } from './publishers/payment-publishers';
import { ListPaymentsQueryDto, UpdatePaymentStatusDto } from './payment.dto';

@Injectable()
export class PaymentService {
  constructor(
    private readonly db: DatabaseService,
    private readonly paymentRepo: PaymentRepository,
    private readonly completedPublisher: PaymentCompletedPublisher,
    private readonly failedPublisher: PaymentFailedPublisher,
  ) {}

  async getPayments(query: ListPaymentsQueryDto, shopId?: string) {
    const [data, total] = await this.paymentRepo.findByShopIdAndFilters(shopId, query);
    
    return {
      data,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        lastPage: Math.ceil(total / query.limit),
      },
      message: 'Payments retrieved successfully',
    };
  }

  async updatePaymentStatus(id: string, dto: UpdatePaymentStatusDto) {
    const payment = await this.paymentRepo.findById(id);
    if (!payment) throw new NotFoundException('Payment not found');

    if (payment.status === dto.status) {
      throw new BadRequestException(`Payment is already ${dto.status}`);
    }

    if (payment.status === 'SUCCESS') {
      throw new BadRequestException('Cannot change status of a successful payment');
    }

    const isSuccess = dto.status === 'SUCCESS';
    const paidAt = isSuccess ? new Date() : undefined;

    const updated = await this.db.$transaction(async (tx) => {
      const p = await tx.payment.update({
        where: { id },
        data: {
          status: dto.status as any,
          ...(dto.transactionId && { transactionId: dto.transactionId }),
          ...(paidAt && { paidAt }),
        },
        include: { order: true },
      });

      if (isSuccess && p.order) {
        // Credit the shop's ledger with the net amount
        await tx.shopLedger.create({
          data: {
            shopId: p.order.shopId,
            type: 'CREDIT',
            amount: p.netAmount,
            reference: `PAYMENT_${p.id}`,
            description: `Payment for order ${p.order.id}`,
          },
        });

        // Update shop balance
        await tx.shop.update({
          where: { id: p.order.shopId, deletedAt: null },
          data: { balance: { increment: p.netAmount } },
        });

        // Update order status
        await tx.order.update({
           where: { id: p.orderId },
           data: { status: 'PAID' }
        });
      }

      if ((dto.status === 'FAILED' || dto.status === 'EXPIRED') && p.order) {
         await tx.order.update({
           where: { id: p.orderId },
           data: { status: 'CANCELLED' }
         });
      }

      return p;
    });

    // @ts-ignore Prisma Decimal unwrap
    const netAmountVal = typeof updated.netAmount.toNumber === 'function' ? updated.netAmount.toNumber() : Number(updated.netAmount);

    if (isSuccess) {
      await this.completedPublisher.publish({
        paymentId: updated.id,
        orderId: updated.orderId,
        shopId: updated.order.shopId,
        netAmount: netAmountVal,
        fees: {
           gateway: updated.gatewayFee,
           marketplace: updated.marketplaceFee
        },
        transactionId: updated.transactionId,
      });
    } else {
      await this.failedPublisher.publish({
        paymentId: updated.id,
        orderId: updated.orderId,
        shopId: updated.order.shopId,
        reason: `Payment manually updated to ${dto.status} by admin`,
      });
    }

    return {
      data: updated,
      message: `Payment status updated to ${dto.status}`,
    };
  }
}
