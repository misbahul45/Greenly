import {
    Injectable,
    Logger,
    OnModuleDestroy,
    OnModuleInit,
} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {randomUUID} from "crypto";
// amqplib is already used by Nest RMQ transport; require keeps this service
// independent from optional type packages.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const amqp = require("amqplib");

type PublishOptions = {
    eventId?: string;
    correlationId?: string;
    source?: string;
    version?: string;
    occurredAt?: string;
    envelope?: boolean;
};

@Injectable()
export class RabbitMqEventBusService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(RabbitMqEventBusService.name);
    private connection?: any;
    private channel?: any;
    private exchange = "greenly_events";

    constructor(private readonly configService: ConfigService) {}

    async onModuleInit() {
        this.exchange =
            this.configService.get<string>("rabbitmq.exchange") ||
            process.env.RABBITMQ_EXCHANGE ||
            "greenly_events";
        try {
            await this.connect();
        } catch (error) {
            this.logger.warn(
                `RabbitMQ unavailable during startup: ${
                    error instanceof Error ? error.message : String(error)
                }`
            );
        }
    }

    async onModuleDestroy() {
        await this.channel?.close().catch(() => undefined);
        await this.connection?.close().catch(() => undefined);
    }

    async publish(
        routingKey: string,
        payload: unknown,
        options: PublishOptions = {}
    ): Promise<void> {
        if (!this.channel) {
            await this.connect();
        }

        const eventId = options.eventId ?? randomUUID();
        const occurredAt = options.occurredAt ?? new Date().toISOString();
        const body =
            options.envelope === false
                ? payload
                : {
                      eventId,
                      eventType: routingKey,
                      version: options.version ?? "1.0",
                      source: options.source ?? "core-service",
                      occurredAt,
                      ...(options.correlationId
                          ? {correlationId: options.correlationId}
                          : {}),
                      payload,
                  };

        const ok = this.channel.publish(
            this.exchange,
            routingKey,
            Buffer.from(JSON.stringify(body)),
            {
                contentType: "application/json",
                deliveryMode: 2,
                persistent: true,
                messageId: eventId,
                type: routingKey,
                timestamp: Math.floor(Date.now() / 1000),
                correlationId: options.correlationId,
            }
        );

        if (!ok) {
            await new Promise((resolve) => this.channel.once("drain", resolve));
        }
        if (typeof this.channel.waitForConfirms === "function") {
            await this.channel.waitForConfirms();
        }

        this.logger.log(`Published ${routingKey} to ${this.exchange}`);
    }

    private async connect() {
        const url =
            this.configService.get<string>("rabbitmq.url") ||
            process.env.RABBITMQ_URL ||
            "amqp://guest:guest@rabbitmq:5672/";

        this.connection = await amqp.connect(url);
        this.channel = await this.connection.createConfirmChannel();
        await this.channel.assertExchange(this.exchange, "topic", {
            durable: true,
        });
    }
}
