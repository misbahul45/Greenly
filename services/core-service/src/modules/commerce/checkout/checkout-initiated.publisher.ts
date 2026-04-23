import { Injectable } from '@nestjs/common';
import { COMMERCE_ROUTING_KEYS } from '../shared/constants/routing-keys.constant';
import { MessaggingService } from '../../../libs/messagging/messagging.service';
import { CheckoutInitiatedPayload } from '../shared/interfaces/commerce.interface';

@Injectable()
export class CheckoutInitiatedPublisher {
  constructor(private readonly broker: MessaggingService) {}

  async publish(payload: CheckoutInitiatedPayload): Promise<void> {
    await this.broker.publish(COMMERCE_ROUTING_KEYS.CHECKOUT_INITIATED, {
      ...payload,
      source: 'core-service',
      version: '1.0',
    });
  }
}
