import { Global, Module } from '@nestjs/common';
import { MessaggingService } from './messagging.service';
import {
  ClientProviderOptions,
  ClientsModule,
  Transport,
} from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  providers: [MessaggingService],
  exports: [MessaggingService],
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'RABBITMQ_CLIENT',
        useFactory: (configService: ConfigService): ClientProviderOptions => {
          const rabbitmq = configService.get('rabbitmq');

          return {
            name: 'RABBITMQ_CLIENT',
            transport: Transport.RMQ,
            options: {
              urls: [rabbitmq.url],
              queue: rabbitmq.queue,
              queueOptions: {
                durable: true,
              },
              noAck: rabbitmq.noAck ?? false,
              persistent: true,
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
  ],
})
export class MessaggingModule {}