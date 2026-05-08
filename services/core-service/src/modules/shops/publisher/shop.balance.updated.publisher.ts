import { Injectable } from '@nestjs/common';
import { MessaggingService } from '../../../libs/messagging/messagging.service';

export interface ShopBalanceUpdatedEvent {
  shopId: string;
  newBalance: string;
  changeAmount: string;
  changeType: 'CREDIT' | 'DEBIT';
  reference: string;
  timestamp: string;
  correlationId?: string;
  source?: string;
  version?: string;
}

@Injectable()
export class ShopBalanceUpdatedPublisher {
  constructor(private readonly broker: MessaggingService) {}

  async publish(payload: ShopBalanceUpdatedEvent): Promise<void> {
    await this.broker.publish('shop.balance.updated', {
      ...payload,
      timestamp: payload.timestamp || new Date().toISOString(),
      source: 'core-service',
      version: '1.0',
    });
  }
}
