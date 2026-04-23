import { Injectable } from '@nestjs/common';
import { MessaggingService } from '../../../libs/messagging/messagging.service';

export interface ShopMemberAddedEvent {
  shopId: string;
  userId: string;
  role: string;
  addedBy: string;
  timestamp: string;
}

export interface ShopMemberRemovedEvent {
  shopId: string;
  userId: string;
  removedBy: string;
  timestamp: string;
}

@Injectable()
export class ShopMemberPublisher {
  constructor(private readonly broker: MessaggingService) {}

  async publishShopMemberAdded(event: ShopMemberAddedEvent): Promise<void> {
    await this.broker.publish('shop.member.added', {
      ...event,
      source: 'core-service',
      version: '1.0',
    });
  }

  async publishShopMemberRemoved(event: ShopMemberRemovedEvent): Promise<void> {
    await this.broker.publish('shop.member.removed', {
      ...event,
      source: 'core-service',
      version: '1.0',
    });
  }
}
