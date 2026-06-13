import {Injectable, Logger} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {Interval} from "@nestjs/schedule";
import {RabbitMqEventBusService} from "../messaging/rabbitmq-event-bus.service";
import {OutboxService} from "./outbox.service";

@Injectable()
export class OutboxPublisherProcessor {
    private readonly logger = new Logger(OutboxPublisherProcessor.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly outbox: OutboxService,
        private readonly eventBus: RabbitMqEventBusService
    ) {}

    @Interval("outbox-publisher", 5000)
    async processBatch() {
        if (process.env.OUTBOX_PUBLISHER_ENABLED === "false") {
            return;
        }

        const batchSize = Number(
            this.configService.get("outbox.batchSize") ||
                process.env.OUTBOX_BATCH_SIZE ||
                50
        );
        const events = await this.outbox.findPublishable(batchSize);

        for (const event of events) {
            const locked = await this.outbox.markProcessing(event.id);
            if (locked.count === 0) continue;

            try {
                await this.eventBus.publish(event.routingKey, event.payload, {
                    eventId: event.id,
                    source: "core-service",
                    version: "1.0",
                });
                await this.outbox.markPublished(event.id);
            } catch (error) {
                this.logger.error(
                    `Failed to publish outbox event ${event.id}: ${
                        error instanceof Error ? error.message : String(error)
                    }`
                );
                await this.outbox.markFailed(event.id, event.attempts, error);
            }
        }
    }
}
