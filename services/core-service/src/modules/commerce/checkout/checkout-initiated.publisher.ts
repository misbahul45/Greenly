import { Injectable } from '@nestjs/common';
import { COMMERCE_ROUTING_KEYS } from '../shared/constants/routing-keys.constant';
import { RabbitMqEventBusService } from '../../../infrastructure/messaging/rabbitmq-event-bus.service';
import { CheckoutInitiatedPayload } from '../shared/interfaces/commerce.interface';

@Injectable()
export class CheckoutInitiatedPublisher {
  constructor(private readonly eventBus: RabbitMqEventBusService) {}

  async publish(payload: CheckoutInitiatedPayload): Promise<void> {
    await this.eventBus.publish(COMMERCE_ROUTING_KEYS.CHECKOUT_INITIATED, {
      ...payload,
      source: 'core-service',
      version: '1.0',
    });
  }
}
