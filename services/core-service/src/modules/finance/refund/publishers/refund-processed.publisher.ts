import { Injectable } from '@nestjs/common';
import { MessaggingService } from '../../../../libs/messagging/messagging.service';
import { FINANCE_EVENTS } from '../../shared/constants/finance-events.constants';
import { RefundProcessedPayload } from '../../shared/interfaces/finance-transaction.interface';

@Injectable()
export class RefundProcessedPublisher {
  constructor(private readonly broker: MessaggingService) {}

  async publish(payload: RefundProcessedPayload): Promise<void> {
    await this.broker.publish(FINANCE_EVENTS.REFUND_PROCESSED, {
      ...payload,
      version: '1.0',
      source: 'core-service',
    });
  }
}
