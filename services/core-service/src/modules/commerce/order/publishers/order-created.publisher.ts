import { Injectable } from '@nestjs/common';
import { RabbitMqEventBusService } from '../../../../infrastructure/messaging/rabbitmq-event-bus.service';
import { OrderCreatedPayload } from '../../shared/interfaces/commerce.interface';
import { COMMERCE_ROUTING_KEYS } from '../../shared/constants/routing-keys.constant';

@Injectable()
export class OrderCreatedPublisher {
  constructor(private readonly eventBus: RabbitMqEventBusService) {}

  async publish(payload: OrderCreatedPayload): Promise<void> {
    await this.eventBus.publish(COMMERCE_ROUTING_KEYS.ORDER_CREATED, {
      ...payload,
      source: 'core-service',
      version: '1.0',
    });
  }
}
