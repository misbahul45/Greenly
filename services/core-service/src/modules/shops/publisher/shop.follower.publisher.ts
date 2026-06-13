import { Injectable } from "@nestjs/common";
import { RabbitMqEventBusService } from "../../../infrastructure/messaging/rabbitmq-event-bus.service";

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
  constructor(private readonly eventBus: RabbitMqEventBusService) {}

  async publishShopFollowerAdded(event: ShopFollowerAddedEvent): Promise<void> {
    await this.eventBus.publish("shop.follower.added", {
      ...event,
      source: "core-service",
      version: "1.0",
    });
  }

  async publishShopFollowerRemoved(event: ShopFollowerRemovedEvent): Promise<void> {
    await this.eventBus.publish("shop.follower.removed", {
      ...event,
      source: "core-service",
      version: "1.0",
    });
  }
}
