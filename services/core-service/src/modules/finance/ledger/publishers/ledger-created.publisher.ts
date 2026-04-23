import { Injectable } from '@nestjs/common';
import { MessaggingService } from '../../../../libs/messagging/messagging.service';
import { FINANCE_EVENTS } from '../../shared/constants/finance-events.constants';
import { FinanceTransactionPayload } from '../../shared/interfaces/finance-transaction.interface';

@Injectable()
export class LedgerCreatedPublisher {
  constructor(private readonly broker: MessaggingService) {}

  async publish(payload: FinanceTransactionPayload): Promise<void> {
    await this.broker.publish(FINANCE_EVENTS.LEDGER_CREATED, {
      ...payload,
      version: '1.0',
      source: 'core-service',
    });
  }
}
