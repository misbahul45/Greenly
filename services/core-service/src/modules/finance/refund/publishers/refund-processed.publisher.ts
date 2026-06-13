import { Injectable } from '@nestjs/common';
import { RabbitMqEventBusService } from '../../../../infrastructure/messaging/rabbitmq-event-bus.service';
import { FINANCE_EVENTS } from '../../shared/constants/finance-events.constants';
import { RefundProcessedPayload } from '../../shared/interfaces/finance-transaction.interface';

@Injectable()
export class RefundProcessedPublisher {
  constructor(private readonly eventBus: RabbitMqEventBusService) {}

  async publish(payload: RefundProcessedPayload): Promise<void> {
    await this.eventBus.publish(FINANCE_EVENTS.REFUND_PROCESSED, {
      ...payload,
      version: '1.0',
      source: 'core-service',
    });
  }
}
