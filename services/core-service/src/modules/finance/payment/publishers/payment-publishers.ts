import { Injectable } from '@nestjs/common';
import { MessaggingService } from '../../../../libs/messagging/messagging.service';
import { FINANCE_EVENTS } from '../../shared/constants/finance-events.constants';

@Injectable()
export class PaymentCompletedPublisher {
  constructor(private readonly broker: MessaggingService) {}

  async publish(payload: any): Promise<void> {
    await this.broker.publish(FINANCE_EVENTS.PAYMENT_COMPLETED, {
      ...payload,
      version: '1.0',
      source: 'core-service',
    });
  }
}

@Injectable()
export class PaymentFailedPublisher {
  constructor(private readonly broker: MessaggingService) {}

  async publish(payload: any): Promise<void> {
    await this.broker.publish(FINANCE_EVENTS.PAYMENT_FAILED, {
      ...payload,
      version: '1.0',
      source: 'core-service',
    });
  }
}
