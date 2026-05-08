import { Injectable } from "@nestjs/common";
import { MessaggingService } from "../../../libs/messagging/messagging.service";

export interface ShopFollowerAddedEvent {
  userId: string;
  shopId: string;
  timestamp: string;
  correlationId: string;
}

export interface ShopFollowerRemovedEvent {
  userId: string;
  shopId: string;
  timestamp: string;
}

@Injectable()
export class ShopFollowerPublisher {
  constructor(private readonly broker: MessaggingService) {}

  async publishShopFollowerAdded(event: ShopFollowerAddedEvent): Promise<void> {
    await this.broker.publish("shop.follower.added", {
      ...event,
      source: "core-service",
      version: "1.0",
    });
  }

  async publishShopFollowerRemoved(event: ShopFollowerRemovedEvent): Promise<void> {
    await this.broker.publish("shop.follower.removed", {
      ...event,
      source: "core-service",
      version: "1.0",
    });
  }
}
