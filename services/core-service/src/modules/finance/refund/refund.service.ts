import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../libs/database/database.service';
import { RefundRepository } from './refund.repository';
import { PaymentRepository } from '../payment/payment.repository';
import { RefundProcessedPublisher } from './publishers/refund-processed.publisher';
import { CreateRefundDto, ApproveRefundDto, ForceRefundDto, ListRefundsQueryDto } from './refund.dto';

@Injectable()
export class RefundService {
  constructor(
    private readonly db: DatabaseService,
    private readonly refundRepo: RefundRepository,
    private readonly paymentRepo: PaymentRepository,
    private readonly publisher: RefundProcessedPublisher,
  ) {}

  async listRefunds(query: ListRefundsQueryDto, shopId?: string) {
    const [data, total] = await this.refundRepo.findByFilters(query, shopId);
    return {
      data,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        lastPage: Math.ceil(total / query.limit),
      },
      message: 'Refunds retrieved successfully',
    };
  }

  async createRefund(dto: CreateRefundDto & { shopId?: string }) {
    return this.db.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id: dto.paymentId },
        include: { order: true },
      });

      if (!payment) throw new NotFoundException('Payment not found');
      if (dto.shopId && payment.order.shopId !== dto.shopId) {
        throw new BadRequestException('Payment does not belong to your shop');
      }
      
      // Ensure there's sufficient shop balance for a refund
      const shop = await tx.shop.findUnique({ where: { id: payment.order.shopId } });
      const shopBalance = Number(shop?.balance || 0);

      if (shopBalance < dto.amount) {
        throw new BadRequestException('Insufficient shop balance for refund');
      }

      const refund = await tx.refund.create({
        data: {
          paymentId: dto.paymentId,
          amount: dto.amount,
          reason: dto.reason,
          status: 'PENDING',
        },
      });

      // Lock balance
      await tx.shopLedger.create({
        data: {
          shopId: payment.order.shopId,
          type: 'DEBIT',
          amount: dto.amount,
          reference: `REFUND_LOCK_${refund.id}`,
          description: `Refund requested for order ${payment.orderId}`,
        },
      });

      await tx.shop.update({
        where: { id: payment.order.shopId },
        data: { balance: { decrement: dto.amount } },
      });

      return {
        data: refund,
        message: 'Refund requested successfully',
      };
    });
  }

  async approveRefund(refundId: string, dto: ApproveRefundDto) {
    const refund = await this.refundRepo.findById(refundId);
    if (!refund) throw new NotFoundException('Refund not found');
    if (refund.status !== 'PENDING') throw new BadRequestException(`Refund is already ${refund.status}`);

    const updated = await this.db.$transaction(async (tx) => {
      const r = await tx.refund.update({
        where: { id: refundId },
        data: { status: 'COMPLETED', ...(dto.notes ? { reason: `${refund.reason} - [Notes: ${dto.notes}]` } : {}) },
        include: { payment: { include: { order: true } } },
      });

      return r;
    });

    // @ts-ignore Prisma Decimal unwrap
    const amountVal = typeof updated.amount.toNumber === 'function' ? updated.amount.toNumber() : Number(updated.amount);

    await this.publisher.publish({
      refundId: updated.id,
      orderId: updated.payment.orderId,
      amount: amountVal,
      reason: updated.reason,
    });

    return {
      data: updated,
      message: 'Refund approved and processed',
    };
  }

  async rejectRefund(refundId: string, dto: ApproveRefundDto) {
     const refund = await this.refundRepo.findById(refundId);
     if (!refund) throw new NotFoundException('Refund not found');
     if (refund.status !== 'PENDING') throw new BadRequestException(`Refund is already ${refund.status}`);

     const updated = await this.db.$transaction(async (tx) => {
        const r = await tx.refund.update({
          where: { id: refundId },
          data: { status: 'REJECTED' },
          include: { payment: { include: { order: true } } },
        });

        // Release locked balance
        await tx.shopLedger.create({
           data: {
             shopId: refund.payment.order.shopId,
             type: 'CREDIT',
             amount: refund.amount,
             reference: `REFUND_REJECTED_${refund.id}`,
             description: `Refund rejected, unlocking balance`,
           }
        });

        await tx.shop.update({
           where: { id: refund.payment.order.shopId },
           data: { balance: { increment: refund.amount } }
        });

        return r;
     });

     return {
       data: updated,
       message: 'Refund rejected and balance returned to shop',
     };
  }

  async forceApprove(refundId: string, dto: ForceRefundDto) {
    // Platform Admin override
    const refund = await this.refundRepo.findById(refundId);
    if (!refund) throw new NotFoundException('Refund not found');
    
    // Process regardless of current status, assuming it's forced
    const updated = await this.db.$transaction(async (tx) => {
      const r = await tx.refund.update({
        where: { id: refundId },
        data: { status: 'COMPLETED', reason: `Forced override: ${dto.reason}` },
        include: { payment: { include: { order: true } } },
      });
      return r;
    });

    // @ts-ignore
    const amountVal = typeof updated.amount.toNumber === 'function' ? updated.amount.toNumber() : Number(updated.amount);

    await this.publisher.publish({
      refundId: updated.id,
      orderId: updated.payment.orderId,
      amount: amountVal,
      reason: updated.reason,
    });

    return {
      data: updated,
      message: 'Refund force approved successfully',
    }
  }
}
