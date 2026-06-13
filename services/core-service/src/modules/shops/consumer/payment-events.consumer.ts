import { Injectable, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import ErrorHandler from '../../../libs/errors/handler.error';
import { z } from 'zod';
import { OrderService } from '../order/order.service';

const PaymentSuccessEventSchema = z.object({
  paymentId: z.string(),
  orderId: z.string(),
  shopId: z.string(),
  userId: z.string(),
  grossAmount: z.coerce.number(),
  gatewayFee: z.coerce.number(),
  marketplaceFee: z.coerce.number(),
  netAmount: z.coerce.number(),
  method: z.string(),
  transactionId: z.string(),
  paidAt: z.string().datetime(),
  timestamp: z.string().datetime().optional(),
  correlationId: z.string().optional(),
  source: z.enum(['core-service', 'payment-service']).optional(),
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
  source: z.enum(['core-service', 'payment-service']).optional(),
  version: z.string().optional(),
});

type PaymentFailedEventDTO = z.infer<typeof PaymentFailedEventSchema>;

@Injectable()
export class PaymentEventsConsumer {
  private readonly logger = new Logger(PaymentEventsConsumer.name);

  constructor(
    private readonly orderService: OrderService,
  ) {}

  @EventPattern('payment.completed')
  async handlePaymentSuccess(@Payload() raw: unknown) {
    try {
      const data = PaymentSuccessEventSchema.parse(this.extractPayload(raw));
      await ErrorHandler(() => this.orderService.updateOrderStatus(data.shopId, data.orderId, 'PAID'));
      this.logger.log(`Successfully processed payment.completed for order ${data.orderId}`);
    } catch (error) {
      this.logger.error(`Failed to process payment.completed: ${error.message}`);
      throw error;
    }
  }

  async handlePaymentSuccessLegacy(@Payload() raw: unknown) {
    try {
      const data = PaymentSuccessEventSchema.parse(this.extractPayload(raw));
      await ErrorHandler(() => this.orderService.updateOrderStatus(data.shopId, data.orderId, 'PAID'));
      this.logger.log(`Successfully processed payment.success (legacy) for order ${data.orderId}`);
    } catch (error) {
      this.logger.error(`Failed to process payment.success (legacy): ${error.message}`);
      throw error;
    }
  }

  @EventPattern('payment.failed')
  async handlePaymentFailed(@Payload() raw: unknown) {
    try {
      const data = PaymentFailedEventSchema.parse(this.extractPayload(raw));
      await ErrorHandler(() => this.orderService.updateOrderStatus(data.shopId, data.orderId, 'CANCELLED'));
      this.logger.log(`Successfully processed payment.failed for order ${data.orderId}`);
    } catch (error) {
      this.logger.error(`Failed to process payment.failed: ${error.message}`);
      throw error;
    }
  }

  private extractPayload(raw: unknown) {
    if (raw && typeof raw === 'object' && 'payload' in raw) {
      const payload = (raw as { payload?: unknown }).payload;
      if (payload && typeof payload === 'object') return payload;
    }
    return raw;
  }
}
