import { Injectable } from '@nestjs/common';
import { MessaggingService } from '../../../libs/messagging/messagging.service';

export interface PromotionUsedPayload {
  promotionId: string;
  code: string;
  userId: string;
  orderId: string;
  discountAmount: number;
}

@Injectable()
export class PromotionUsedPublisher {
  constructor(private readonly broker: MessaggingService) {}

  async publish(payload: PromotionUsedPayload): Promise<void> {
    await this.broker.publish('promotion.used', {
      ...payload,
      timestamp: new Date().toISOString(),
    });
  }
}
