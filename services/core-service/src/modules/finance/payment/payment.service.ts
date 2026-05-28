import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../libs/database/database.service';
import { PaymentRepository } from './payment.repository';
import { PaymentCompletedPublisher, PaymentFailedPublisher } from './publishers/payment-publishers';
import { CreateStripeIntentDto, ListPaymentsQueryDto, UpdatePaymentStatusDto } from './payment.dto';
import Stripe from 'stripe';
import type { Request } from 'express';

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

    if (payment.status === 'SUCCESS' && dto.status !== 'REFUNDED') {
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
        await tx.shopLedger.create({
          data: {
            shopId: p.order.shopId,
            type: 'CREDIT',
            amount: p.netAmount,
            reference: `PAYMENT_${p.id}`,
            description: `Payment for order ${p.order.id}`,
          },
        });

        await tx.shop.update({
          where: { id: p.order.shopId },
          data: { balance: { increment: p.netAmount } },
        });

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

  async createStripeIntent(userId: string, dto: CreateStripeIntentDto) {
    const stripe = this.createStripeClient();
    const order = await this.db.order.findFirst({
      where: {
        id: dto.orderId,
        userId,
      },
      include: {
        payment: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== 'PENDING') {
      throw new BadRequestException('Order is not payable');
    }

    if (order.payment?.status === 'SUCCESS') {
      throw new BadRequestException('Order already paid');
    }

    const grossAmount = this.toNumber(order.totalAmount);
    const marketplaceFee = Math.round(grossAmount * 0.05);
    const gatewayFee = 0;
    const netAmount = grossAmount - marketplaceFee - gatewayFee;

    const payment = await this.db.payment.upsert({
      where: { orderId: order.id },
      create: {
        orderId: order.id,
        grossAmount,
        gatewayFee,
        marketplaceFee,
        netAmount,
        method: 'STRIPE',
        status: 'PENDING',
      },
      update: {
        grossAmount,
        gatewayFee,
        marketplaceFee,
        netAmount,
        method: 'STRIPE',
        status: 'PENDING',
      },
    });

    const currency = process.env.STRIPE_CURRENCY || 'idr';
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(grossAmount),
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        orderId: order.id,
        paymentId: payment.id,
        userId,
      },
    });

    await this.db.payment.update({
      where: { id: payment.id },
      data: {
        transactionId: intent.id,
      },
    });

    return {
      data: {
        paymentId: payment.id,
        clientSecret: intent.client_secret,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY ?? '',
        amount: Math.round(grossAmount),
        currency,
      },
      message: 'Stripe payment intent created',
    };
  }

  async handleStripeWebhook(request: Request & { rawBody?: Buffer }, signature?: string) {
    const event = this.constructStripeEvent(request, signature);

    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object as any;
      return this.applyStripeSuccess(intent);
    }

    if (event.type === 'payment_intent.payment_failed') {
      const intent = event.data.object as any;
      return this.applyStripeFailure(intent);
    }

    if (event.type === 'charge.refunded') {
      const charge = event.data.object as any;
      return this.applyStripeRefund(charge);
    }

    return {
      data: { received: true, type: event.type },
      message: 'Stripe webhook ignored',
    };
  }

  private async applyStripeSuccess(intent: any) {
    const payment = await this.findStripePayment(intent);
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    const updated = await this.db.$transaction(async (tx) => {
      const current = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'SUCCESS',
          transactionId: intent.id,
          method: 'STRIPE',
          paidAt: new Date(),
        },
        include: { order: true },
      });

      await tx.order.update({
        where: { id: current.orderId },
        data: { status: 'PAID' },
      });

      await tx.shopLedger.create({
        data: {
          shopId: current.order.shopId,
          type: 'CREDIT',
          amount: current.netAmount,
          reference: `PAYMENT_${current.id}`,
          description: `Payment for order ${current.orderId}`,
        },
      });

      await tx.shop.update({
        where: { id: current.order.shopId },
        data: { balance: { increment: current.netAmount } },
      });

      return current;
    });

    await this.completedPublisher.publish({
      paymentId: updated.id,
      orderId: updated.orderId,
      shopId: updated.order.shopId,
      netAmount: this.toNumber(updated.netAmount),
      fees: {
        gateway: updated.gatewayFee,
        marketplace: updated.marketplaceFee,
      },
      transactionId: intent.id,
    });

    return {
      data: { received: true, paymentId: updated.id, status: updated.status },
      message: 'Stripe payment succeeded',
    };
  }

  private async applyStripeFailure(intent: any) {
    const payment = await this.findStripePayment(intent);
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    const updated = await this.db.$transaction(async (tx) => {
      const current = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          transactionId: intent.id,
          method: 'STRIPE',
        },
        include: { order: true },
      });

      await tx.order.update({
        where: { id: current.orderId },
        data: { status: 'CANCELLED' },
      });

      return current;
    });

    await this.failedPublisher.publish({
      paymentId: updated.id,
      orderId: updated.orderId,
      shopId: updated.order.shopId,
      reason: intent.last_payment_error?.message ?? 'Stripe payment failed',
    });

    return {
      data: { received: true, paymentId: updated.id, status: updated.status },
      message: 'Stripe payment failed',
    };
  }

  private async applyStripeRefund(charge: any) {
    const paymentIntentId = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;
    if (!paymentIntentId) {
      return {
        data: { received: true },
        message: 'Stripe refund has no payment intent',
      };
    }

    await this.db.payment.updateMany({
      where: { transactionId: paymentIntentId },
      data: { status: 'REFUNDED' },
    });

    const updated = await this.db.payment.findFirst({
      where: { transactionId: paymentIntentId },
      include: { order: true },
    });

    if (!updated) {
      throw new NotFoundException('Payment not found');
    }

    return {
      data: { received: true, paymentId: updated.id, status: updated.status },
      message: 'Stripe charge refunded',
    };
  }

  private constructStripeEvent(request: Request & { rawBody?: Buffer }, signature?: string) {
    const stripe = this.createStripeClient();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (webhookSecret) {
      if (!signature) {
        throw new BadRequestException('Missing Stripe signature');
      }

      return stripe.webhooks.constructEvent(
        request.rawBody ?? Buffer.from(JSON.stringify(request.body)),
        signature,
        webhookSecret,
      );
    }

    return request.body as any;
  }

  private async findStripePayment(intent: any) {
    const paymentId = intent.metadata?.paymentId;
    const orderId = intent.metadata?.orderId;

    if (paymentId) {
      return this.db.payment.findUnique({
        where: { id: paymentId },
        include: { order: true },
      });
    }

    if (orderId) {
      return this.db.payment.findUnique({
        where: { orderId },
        include: { order: true },
      });
    }

    return this.db.payment.findFirst({
      where: { transactionId: intent.id },
      include: { order: true },
    });
  }

  private createStripeClient() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new BadRequestException('Stripe secret key is not configured');
    }

    return new Stripe(secretKey);
  }

  private toNumber(value: unknown) {
    if (value && typeof (value as { toNumber?: unknown }).toNumber === 'function') {
      return (value as { toNumber: () => number }).toNumber();
    }

    return Number(value);
  }
}
