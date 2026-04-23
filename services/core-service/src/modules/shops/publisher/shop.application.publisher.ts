import { Injectable } from '@nestjs/common';
import { MessaggingService } from '../../../libs/messagging/messagging.service';
import * as crypto from 'crypto';

export interface ShopApplicationSubmittedEvent {
  shopId: string;
  timestamp: string;
  correlationId: string;
}

export interface ShopApprovedEvent {
  shopId: string;
  ownerId: string;
  applicationId: string;
  timestamp: string;
  correlationId: string;
}

@Injectable()
export class ShopApplicationPublisher {
  constructor(private readonly broker: MessaggingService) {}

  async publishApplicationSubmitted(payload: ShopApplicationSubmittedEvent): Promise<void> {
    await this.broker.publish('shop.application.submitted', {
      ...payload,
      source: 'core-service',
      version: '1.0',
    });
  }

  async publishShopApproved(payload: ShopApprovedEvent): Promise<void> {
    await this.broker.publish('shop.approved', {
      ...payload,
      source: 'core-service',
      version: '1.0',
    });
  }
}
