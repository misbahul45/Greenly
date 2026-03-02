import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './libs/interceptors/respon.interceptor';
import { GlobalExceptionFilter } from './libs/filters/global-exception.filter';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const queue = configService.get<string>('rabbitmq.queue') ?? 'greenly_queue';
  const url = configService.get<string>('rabbitmq.url') ?? 'amqp://guest:guest@rabbitmq:5672/';

  console.log({
    queue,
    url
  })

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [url],
      queue,
      queueOptions: { durable: true },
      noAck: configService.get('rabbitmq.noAck') ?? false,
    },
  });

  await app.startAllMicroservices();

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter());
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();