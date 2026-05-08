import { Injectable } from '@nestjs/common';
import { MessaggingService } from '../../../../libs/messagging/messagging.service';
import { RefundProcessedPayload } from '../../shared/interfaces/commerce.interface';
import { COMMERCE_ROUTING_KEYS } from '../../shared/constants/routing-keys.constant';

@Injectable()
export class RefundProcessedPublisher {
  constructor(private readonly broker: MessaggingService) {}

  async publish(payload: RefundProcessedPayload): Promise<void> {
    await this.broker.publish(COMMERCE_ROUTING_KEYS.REFUND_PROCESSED, {
      ...payload,
      source: 'core-service',
      version: '1.0',
    });
  }
}
