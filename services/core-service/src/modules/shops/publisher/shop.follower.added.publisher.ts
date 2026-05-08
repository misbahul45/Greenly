import { Injectable } from '@nestjs/common';
import { MessaggingService } from '../../../libs/messagging/messagging.service';

export interface ShopFollowerAddedEvent {
  userId: string;
  shopId: string;
  timestamp: string;
  correlationId?: string;
  source?: string;
  version?: string;
}

@Injectable()
export class ShopFollowerAddedPublisher {
  constructor(private readonly broker: MessaggingService) {}

  async publish(payload: ShopFollowerAddedEvent): Promise<void> {
    await this.broker.publish('shop.follower.added', {
      ...payload,
      timestamp: payload.timestamp || new Date().toISOString(),
      source: 'core-service',
      version: '1.0',
    });
  }
}
