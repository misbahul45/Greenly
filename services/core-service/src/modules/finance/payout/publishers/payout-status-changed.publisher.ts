import { Injectable } from '@nestjs/common';
import { MessaggingService } from '../../../../libs/messagging/messagging.service';
import { FINANCE_EVENTS } from '../../shared/constants/finance-events.constants';
import { PayoutStatusChangedPayload } from '../../shared/interfaces/finance-transaction.interface';

@Injectable()
export class PayoutStatusChangedPublisher {
  constructor(private readonly broker: MessaggingService) {}

  async publish(payload: PayoutStatusChangedPayload): Promise<void> {
    await this.broker.publish(FINANCE_EVENTS.PAYOUT_STATUS_CHANGED, {
      ...payload,
      version: '1.0',
      source: 'core-service',
    });
  }
}
