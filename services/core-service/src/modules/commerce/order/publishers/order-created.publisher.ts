import { Injectable } from '@nestjs/common';
import { MessaggingService } from '../../../../libs/messagging/messagging.service';
import { OrderCreatedPayload } from '../../shared/interfaces/commerce.interface';
import { COMMERCE_ROUTING_KEYS } from '../../shared/constants/routing-keys.constant';

@Injectable()
export class OrderCreatedPublisher {
  constructor(private readonly broker: MessaggingService) {}

  async publish(payload: OrderCreatedPayload): Promise<void> {
    await this.broker.publish(COMMERCE_ROUTING_KEYS.ORDER_CREATED, {
      ...payload,
      source: 'core-service',
      version: '1.0',
    });
  }
}
