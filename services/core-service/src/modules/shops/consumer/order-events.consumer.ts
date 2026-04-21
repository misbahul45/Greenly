import { Injectable, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import ErrorHandler from '../../../libs/errors/handler.error';
import { z } from 'zod';

const OrderCancelledEventSchema = z.object({
  orderId: z.string(),
  shopId: z.string(),
  reason: z.string(),
  timestamp: z.string().datetime(),
  correlationId: z.string().optional(),
  source: z.string().optional(),
  version: z.string().optional(),
});

type OrderCancelledEventDTO = z.infer<typeof OrderCancelledEventSchema>;

@Injectable()
export class OrderEventsConsumer {
  private readonly logger = new Logger(OrderEventsConsumer.name);

  // In real implementation, inject InventoryService or RefundService
  // constructor(private readonly refundService: RefundService) {}

  @EventPattern('order.cancelled')
  async handleOrderCancelled(@Payload() raw: unknown) {
    try {
      const data = OrderCancelledEventSchema.parse(raw);
      // Example integration: ErrorHandler(() => this.refundService.initiateRefund(data.orderId, data.reason))
      this.logger.log(`Successfully processed order.cancelled for order ${data.orderId}`);
    } catch (error) {
      this.logger.error(`Failed to process order.cancelled: ${error.message}`);
      throw error;
    }
  }
}
