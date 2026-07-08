import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { RabbitMqEventBusService } from "../../infrastructure/messaging/rabbitmq-event-bus.service";
import { firstValueFrom } from "rxjs";

@Injectable()
export class MessaggingService {
  constructor(
    @Inject("RABBITMQ_CLIENT")
    private readonly client: ClientProxy,
    private readonly eventBus: RabbitMqEventBusService,
  ) {}

  // Event (Fire & Forget)
  async publish(event: string, payload: unknown) {
    await this.eventBus.publish(event, payload);
  }

  // RPC
  async request<T>(
    pattern: string,
    payload: unknown,
  ): Promise<T> {
    return firstValueFrom(
      this.client.send<T>(pattern, payload),
    );
  }
}