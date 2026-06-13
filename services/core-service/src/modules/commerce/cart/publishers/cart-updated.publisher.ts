import { Injectable } from '@nestjs/common';
import { RabbitMqEventBusService } from '../../../../infrastructure/messaging/rabbitmq-event-bus.service';
import { CartUpdatedPayload } from '../../shared/interfaces/commerce.interface';
import { COMMERCE_ROUTING_KEYS } from '../../shared/constants/routing-keys.constant';

@Injectable()
export class CartUpdatedPublisher {
  constructor(private readonly eventBus: RabbitMqEventBusService) {}

  async publish(payload: CartUpdatedPayload): Promise<void> {
    await this.eventBus.publish(COMMERCE_ROUTING_KEYS.CART_UPDATED, {
      ...payload,
      source: 'core-service',
      version: '1.0',
    });
  }
}
