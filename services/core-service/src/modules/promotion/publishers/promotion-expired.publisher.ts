import { Injectable } from '@nestjs/common';
import { MessaggingService } from '../../../libs/messagging/messagging.service';

export interface PromotionExpiredPayload {
  promotionId: string;
  code: string;
  endedAt: string;
}

@Injectable()
export class PromotionExpiredPublisher {
  constructor(private readonly broker: MessaggingService) {}

  async publish(payload: PromotionExpiredPayload): Promise<void> {
    await this.broker.publish('promotion.expired', {
      ...payload,
      timestamp: new Date().toISOString(),
    });
  }
}
