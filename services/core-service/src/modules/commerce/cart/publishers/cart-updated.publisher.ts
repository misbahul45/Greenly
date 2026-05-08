import { Injectable } from '@nestjs/common';
import { MessaggingService } from '../../../../libs/messagging/messagging.service';
import { CartUpdatedPayload } from '../../shared/interfaces/commerce.interface';
import { COMMERCE_ROUTING_KEYS } from '../../shared/constants/routing-keys.constant';

@Injectable()
export class CartUpdatedPublisher {
  constructor(private readonly broker: MessaggingService) {}

  async publish(payload: CartUpdatedPayload): Promise<void> {
    await this.broker.publish(COMMERCE_ROUTING_KEYS.CART_UPDATED, {
      ...payload,
      source: 'core-service',
      version: '1.0',
    });
  }
}
