import { Injectable } from '@nestjs/common';
import { MessaggingService } from '../../../../libs/messagging/messagging.service';
import { OrderStatusChangedPayload } from '../../shared/interfaces/commerce.interface';
import { COMMERCE_ROUTING_KEYS } from '../../shared/constants/routing-keys.constant';

@Injectable()
export class OrderStatusChangedPublisher {
  constructor(private readonly broker: MessaggingService) {}

  async publish(payload: OrderStatusChangedPayload): Promise<void> {
    await this.broker.publish(COMMERCE_ROUTING_KEYS.ORDER_STATUS_CHANGED, {
      ...payload,
      source: 'core-service',
      version: '1.0',
    });
  }
}
