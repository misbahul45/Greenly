import { Injectable } from '@nestjs/common';
import { MessaggingService } from '../../../libs/messagging/messagging.service';

export interface ShopOrderStatusChangedEvent {
  orderId: string;
  shopId: string;
  previousStatus: string;
  newStatus: string;
  timestamp: string;
  correlationId?: string;
  source?: string;
  version?: string;
}

@Injectable()
export class ShopOrderStatusChangedPublisher {
  constructor(private readonly broker: MessaggingService) {}

  async publish(payload: ShopOrderStatusChangedEvent): Promise<void> {
    await this.broker.publish('shop.order.status_changed', {
      ...payload,
      timestamp: payload.timestamp || new Date().toISOString(),
      source: 'core-service',
      version: '1.0',
    });
  }
}
