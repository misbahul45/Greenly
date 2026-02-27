import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './libs/interceptors/respon.interceptor';
import { GlobalExceptionFilter } from './libs/filters/global-exception.filter';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const urls = [configService.get<string>('rabbitmq.url') ?? 'amqp://localhost:5672'];
  const queue = configService.get<string>('rabbitmq.queue') ?? 'default_queue';

  const microservice = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls,
      queue,
      queueOptions: { durable: true },
    },
  });

  await app.startAllMicroservices();

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter());
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();