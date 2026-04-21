import { Injectable } from '@nestjs/common';
import { MessaggingService } from '../../../libs/messagging/messagging.service';
import { PromotionType } from '../../../../generated/prisma/enums';

export interface PromotionCreatedPayload {
  promotionId: string;
  code: string;
  type: PromotionType;
  discountVal: number;
  createdBy: string;
}

@Injectable()
export class PromotionCreatedPublisher {
  constructor(private readonly broker: MessaggingService) {}

  async publish(payload: PromotionCreatedPayload): Promise<void> {
    await this.broker.publish('promotion.created', {
      ...payload,
      timestamp: new Date().toISOString(),
    });
  }
}
