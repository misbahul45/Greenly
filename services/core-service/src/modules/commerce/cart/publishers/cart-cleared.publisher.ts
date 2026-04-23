import { Injectable } from '@nestjs/common';
import { MessaggingService } from '../../../../libs/messagging/messagging.service';
import { CartClearedPayload } from '../../shared/interfaces/commerce.interface';
import { COMMERCE_ROUTING_KEYS } from '../../shared/constants/routing-keys.constant';

@Injectable()
export class CartClearedPublisher {
  constructor(private readonly broker: MessaggingService) {}

  async publish(payload: CartClearedPayload): Promise<void> {
    await this.broker.publish(COMMERCE_ROUTING_KEYS.CART_CLEARED, {
      ...payload,
      source: 'core-service',
      version: '1.0',
    });
  }
}
