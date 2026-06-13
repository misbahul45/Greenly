import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { RabbitMqEventBusService } from '../../infrastructure/messaging/rabbitmq-event-bus.service';

@Injectable()
export class MessaggingService {
    constructor(
    @Inject('RABBITMQ_CLIENT')
    private readonly client: ClientProxy,
    private readonly eventBus: RabbitMqEventBusService,
  ) {}

  async publish(event: string, payload: any) {
    return this.eventBus.publish(event, payload);
  }

  async request<T = any>(pattern: string, payload: any): Promise<T> {
    return firstValueFrom(
      this.client.send<T>(pattern, payload),
    );
  }
}
