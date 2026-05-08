import { Injectable } from "@nestjs/common";
import { MessaggingService } from "../../../libs/messagging/messagging.service";

export interface ShopPayoutRequestedEvent {
  shopId: string;
  payoutId: string;
  amount: string;
  timestamp: string;
  correlationId: string;
}

@Injectable()
export class ShopFinancePublisher {
  constructor(private readonly broker: MessaggingService) {}

  async publishPayoutRequested(event: ShopPayoutRequestedEvent): Promise<void> {
    await this.broker.publish("shop.payout.requested", {
      ...event,
      source: "core-service",
      version: "1.0",
    });
  }
}
