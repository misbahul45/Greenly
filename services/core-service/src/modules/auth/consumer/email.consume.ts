import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import CircuitBreaker from "opossum";
import { sendEmail } from "../../../common/utils/email";
import { PayloadEmail } from "../../../common/types/event";
import { AppError } from "../../../libs/errors/app.error";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const amqp = require("amqplib");

@Injectable()
export class EmailConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EmailConsumer.name);

  private connection: any;
  private channel: any;

  private readonly queue = "greenly_queue";
  private readonly exchange = "greenly_events";

  private breaker: CircuitBreaker;

  constructor(
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    this.breaker = new CircuitBreaker(
      async (emailData: any) => sendEmail(emailData),
      {
        timeout: 5000,
        errorThresholdPercentage: 50,
        resetTimeout: 10000,
      },
    );

    this.breaker.on("open", () =>
      this.logger.warn("Circuit Breaker OPEN"),
    );

    this.breaker.on("halfOpen", () =>
      this.logger.warn("Circuit Breaker HALF OPEN"),
    );

    this.breaker.on("close", () =>
      this.logger.log("Circuit Breaker CLOSED"),
    );

    this.breaker.fallback((data) => {
      this.logger.warn(
        `Email fallback : ${data.email}`,
      );
    });

    await this.connect();
  }

  async onModuleDestroy() {
    await this.channel?.close().catch(() => {});
    await this.connection?.close().catch(() => {});
  }

  private async connect() {
    try {
      const url =
        this.config.get<string>("rabbitmq.url")!;

      this.logger.log("Connecting RabbitMQ...");

      this.connection = await amqp.connect(url);

      this.connection.on("close", () => {
        this.logger.warn(
          "RabbitMQ closed. Reconnecting..."
        );

        setTimeout(() => this.connect(), 5000);
      });

      this.connection.on("error", (err: any) => {
        this.logger.error(err);
      });

      this.channel =
        await this.connection.createChannel();

      await this.channel.assertExchange(
        this.exchange,
        "topic",
        {
          durable: true,
        },
      );

      await this.channel.assertQueue(this.queue, {
        durable: true,
      });

      const routingKeys = [
        "auth.user.registered",
        "auth.user.password.reset.requested",
        "auth.user.resend.token",
        "auth.user.deleted",
      ];

      for (const key of routingKeys) {
        await this.channel.bindQueue(
          this.queue,
          this.exchange,
          key,
        );
      }

      this.channel.consume(
        this.queue,
        async (msg: any) => {
          if (!msg) return;

          try {
            const routingKey =
              msg.fields.routingKey;

            const body = JSON.parse(
              msg.content.toString(),
            );

            const payload: PayloadEmail =
              body.payload ?? body;

            await this.handleMessage(
              routingKey,
              payload,
            );

            this.channel.ack(msg);
          } catch (err) {
            this.logger.error(err);

            this.channel.nack(
              msg,
              false,
              true,
            );
          }
        },
      );

      this.logger.log(
        "Email Consumer Ready."
      );
    } catch (err) {
      this.logger.error(err);

      setTimeout(() => this.connect(), 5000);
    }
  }

  private async handleMessage(
    routingKey: string,
    payload: PayloadEmail,
  ) {
    const emailConfig = this.config.get(
      "emailJs",
      {
        infer: true,
      },
    );

    if (!emailConfig) {
      throw new AppError(
        "Email config not found",
        500,
      );
    }

    await this.breaker.fire({
      serviceId: emailConfig.serviceId,
      templateId:
        emailConfig.templates.verifyEmail,
      userId: emailConfig.userId,
      accessToken:
        emailConfig.accessToken,
      email: payload.email,
      name: payload.name,
      token: payload.otp,
      action: payload.action,
    });

    this.logger.log(
      `Email processed : ${routingKey} -> ${payload.email}`,
    );
  }
}