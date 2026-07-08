import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { randomUUID } from "crypto";

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
export class RabbitMqEventBusService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(RabbitMqEventBusService.name);

  private connection?: any;
  private channel?: any;

  private reconnecting = false;
  private reconnectDelay = 5000;

  private exchange = "greenly_events";

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    this.exchange =
      this.config.get<string>("rabbitmq.exchange") ??
      process.env.RABBITMQ_EXCHANGE ??
      "greenly_events";

    await this.connect();
  }

  async onModuleDestroy() {
    await this.close();
  }

  async publish(
    routingKey: string,
    payload: unknown,
    options: PublishOptions = {},
  ): Promise<void> {
    await this.ensureChannel();

    const eventId = options.eventId ?? randomUUID();

    const body =
      options.envelope === false
        ? payload
        : {
            eventId,
            eventType: routingKey,
            version: options.version ?? "1.0",
            source: options.source ?? "core-service",
            occurredAt:
              options.occurredAt ??
              new Date().toISOString(),
            correlationId: options.correlationId,
            payload,
          };

    const published = this.channel.publish(
      this.exchange,
      routingKey,
      Buffer.from(JSON.stringify(body)),
      {
        persistent: true,
        deliveryMode: 2,
        contentType: "application/json",
        messageId: eventId,
        timestamp: Date.now(),
        correlationId: options.correlationId,
        type: routingKey,
      },
    );

    if (!published) {
      await new Promise((resolve) =>
        this.channel.once("drain", resolve),
      );
    }

    await this.channel.waitForConfirms();

    this.logger.debug(
      `Published ${routingKey}`,
    );
  }

  // ----------------------------------------------------------------

  private async ensureChannel() {
    if (!this.connection || !this.channel) {
      await this.connect();
    }
  }

  private async connect() {
    if (this.reconnecting) return;

    this.reconnecting = true;

    while (!this.connection) {
      try {
        const url =
          this.config.get<string>("rabbitmq.url") ??
          process.env.RABBITMQ_URL ??
          "amqp://guest:guest@rabbitmq:5672/?heartbeat=30";

        this.logger.log("Connecting RabbitMQ...");

        this.connection = await amqp.connect(url);

        this.connection.on("close", () => {
          this.logger.warn(
            "RabbitMQ connection closed.",
          );

          this.connection = undefined;
          this.channel = undefined;

          this.reconnect();
        });

        this.connection.on("error", (err: Error) => {
          this.logger.error(err.message);

          this.connection = undefined;
          this.channel = undefined;
        });

        this.channel =
          await this.connection.createConfirmChannel();

        await this.channel.assertExchange(
          this.exchange,
          "topic",
          {
            durable: true,
          },
        );

        this.logger.log(
          "RabbitMQ connected successfully.",
        );

        this.reconnectDelay = 5000;
      } catch (err: any) {
        this.logger.error(
          `RabbitMQ connect failed: ${err.message}`,
        );

        await this.sleep(this.reconnectDelay);

        this.reconnectDelay = Math.min(
          this.reconnectDelay * 2,
          30000,
        );
      }
    }

    this.reconnecting = false;
  }

  private async reconnect() {
    if (this.reconnecting) return;

    this.connection = undefined;
    this.channel = undefined;

    await this.connect();
  }

  private async close() {
    try {
      await this.channel?.close();
    } catch {}

    try {
      await this.connection?.close();
    } catch {}

    this.channel = undefined;
    this.connection = undefined;
  }

  private sleep(ms: number) {
    return new Promise((r) =>
      setTimeout(r, ms),
    );
  }
}