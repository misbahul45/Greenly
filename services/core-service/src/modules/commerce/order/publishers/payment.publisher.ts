import { Injectable } from '@nestjs/common';
import { MessaggingService } from '../../../../libs/messagging/messagging.service';
import { PaymentCompletedPayload, PaymentFailedPayload } from '../../shared/interfaces/commerce.interface';
import { COMMERCE_ROUTING_KEYS } from '../../shared/constants/routing-keys.constant';

@Injectable()
export class PaymentCompletedPublisher {
  constructor(private readonly broker: MessaggingService) {}

  async publish(payload: PaymentCompletedPayload): Promise<void> {
    await this.broker.publish(COMMERCE_ROUTING_KEYS.PAYMENT_COMPLETED, {
      ...payload,
      source: 'core-service',
      version: '1.0',
    });
  }
}

@Injectable()
export class PaymentFailedPublisher {
  constructor(private readonly broker: MessaggingService) {}

  async publish(payload: PaymentFailedPayload): Promise<void> {
    await this.broker.publish(COMMERCE_ROUTING_KEYS.PAYMENT_FAILED, {
      ...payload,
      source: 'core-service',
      version: '1.0',
    });
  }
}
