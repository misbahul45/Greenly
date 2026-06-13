import {Injectable} from "@nestjs/common";
import {RabbitMqEventBusService} from "../../../infrastructure/messaging/rabbitmq-event-bus.service";

export interface ShopVerifiedEvent {
    shopId: string;
    shopName?: string;
    verifiedBy?: string;
    timestamp?: string;
    correlationId?: string;
}

@Injectable()
export class ShopVerifiedPublisher {
    constructor(private readonly eventBus: RabbitMqEventBusService) {}

    async publish(payload: ShopVerifiedEvent): Promise<void> {
        await this.eventBus.publish("shop.verified", {
            ...payload,
            timestamp: payload.timestamp ?? new Date().toISOString(),
            source: "core-service",
            version: "1.0",
        });
    }
}
