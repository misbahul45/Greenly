import { Injectable, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import ErrorHandler from '../../../libs/errors/handler.error';
import { z } from 'zod';
import { FinanceService } from '../finance/finance.service';
import { OrderService } from '../order/order.service';

const PaymentSuccessEventSchema = z.object({
  orderId: z.string(),
  shopId: z.string(),
  userId: z.string(),
  grossAmount: z.string(),
  gatewayFee: z.string(),
  marketplaceFee: z.string(),
  netAmount: z.string(),
  transactionId: z.string(),
  paidAt: z.string().datetime(),
  timestamp: z.string().datetime(),
  correlationId: z.string().optional(),
  source: z.literal('payment-service'),
  version: z.string().optional(),
});

type PaymentSuccessEventDTO = z.infer<typeof PaymentSuccessEventSchema>;

const PaymentFailedEventSchema = z.object({
  orderId: z.string(),
  shopId: z.string(),
  userId: z.string(),
  reason: z.string(),
  timestamp: z.string().datetime(),
  correlationId: z.string().optional(),
  source: z.literal('payment-service'),
  version: z.string().optional(),
});

type PaymentFailedEventDTO = z.infer<typeof PaymentFailedEventSchema>;

@Injectable()
export class PaymentEventsConsumer {
  private readonly logger = new Logger(PaymentEventsConsumer.name);

  constructor(
    private readonly orderService: OrderService,
    private readonly financeService: FinanceService,
  ) {}

  @EventPattern('payment.success')
  async handlePaymentSuccess(@Payload() raw: unknown) {
    try {
      const data = PaymentSuccessEventSchema.parse(raw);
      await ErrorHandler(() => this.orderService.updateOrderStatus(data.shopId, data.orderId, 'PAID'));
      this.logger.log(`Successfully processed payment.success for order ${data.orderId}`);
    } catch (error) {
      this.logger.error(`Failed to process payment.success: ${error.message}`);
      throw error;
    }
  }

  @EventPattern('payment.failed')
  async handlePaymentFailed(@Payload() raw: unknown) {
    try {
      const data = PaymentFailedEventSchema.parse(raw);
      await ErrorHandler(() => this.orderService.updateOrderStatus(data.shopId, data.orderId, 'CANCELLED'));
      this.logger.log(`Successfully processed payment.failed for order ${data.orderId}`);
    } catch (error) {
      this.logger.error(`Failed to process payment.failed: ${error.message}`);
      throw error;
    }
  }
}
