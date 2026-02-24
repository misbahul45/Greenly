import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MessaggingService {
    constructor(
    @Inject('RABBITMQ_CLIENT')
    private readonly client: ClientProxy,
  ) {}

  async publish(event: string, payload: any) {
    return firstValueFrom(
      this.client.emit(event, payload),
    );
  }

  async request<T = any>(pattern: string, payload: any): Promise<T> {
    return firstValueFrom(
      this.client.send<T>(pattern, payload),
    );
  }
}
