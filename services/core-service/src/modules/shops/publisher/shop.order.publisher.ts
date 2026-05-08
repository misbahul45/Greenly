import { Injectable } from "@nestjs/common";
import { MessaggingService } from "../../../libs/messagging/messagging.service";

export interface ShopOrderStatusChangedEvent {
  orderId: string;
  shopId: string;
  previousStatus: string;
  newStatus: string;
  timestamp: string;
  correlationId: string;
}

export interface RefundProcessedEvent {
  refundId: string;
  orderId: string;
  amount: string;
  status: string;
  timestamp: string;
}

@Injectable()
export class ShopOrderPublisher {
  constructor(private readonly broker: MessaggingService) {}

  async publishShopOrderStatusChanged(event: ShopOrderStatusChangedEvent): Promise<void> {
    await this.broker.publish("shop.order.status_changed", {
      ...event,
      source: "core-service",
      version: "1.0",
    });
  }

  async publishRefundProcessed(event: RefundProcessedEvent): Promise<void> {
    await this.broker.publish("shop.order.refund_processed", {
      ...event,
      source: "core-service",
      version: "1.0",
    });
  }
}
