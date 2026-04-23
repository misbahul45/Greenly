import { Injectable } from "@nestjs/common";
import { MessaggingService } from "../../../libs/messagging/messagging.service";
import { ShopCreatedEvent } from "../types";

@Injectable()
export class ShopCreatedPublisher {
  constructor(private readonly broker: MessaggingService) {}

  async publish(event: ShopCreatedEvent): Promise<void> {
    await this.broker.publish("shop.created", {
      ...event,
      source: "core-service",
      version: "1.0",
    });
  }
}