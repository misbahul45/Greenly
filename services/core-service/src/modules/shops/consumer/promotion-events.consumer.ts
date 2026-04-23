import { Injectable, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { z } from 'zod';

const PromotionActivatedEventSchema = z.object({
  promotionId: z.string(),
  code: z.string(),
  discountVal: z.string(),
  type: z.enum(['PERCENTAGE', 'FIXED']),
  eligibleShopIds: z.array(z.string()).optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  timestamp: z.string().datetime().optional(),
  correlationId: z.string().optional(),
  source: z.literal('promotion-service').optional(),
});

@Injectable()
export class PromotionEventsConsumer {
  private readonly logger = new Logger(PromotionEventsConsumer.name);

  @EventPattern('promotion.activated')
  async handlePromotionActivated(@Payload() raw: unknown) {
    try {
      const data = PromotionActivatedEventSchema.parse(raw);
      // Logic: Cache eligible shops in redis
      this.logger.log(`Successfully processed promotion.activated for promo ${data.code}`);
    } catch (error) {
      this.logger.error(`Failed to process promotion.activated: ${error.message}`);
      throw error;
    }
  }
}
