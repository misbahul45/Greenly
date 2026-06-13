import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { MessaggingModule } from './messagging/messagging.module';
import { RabbitMqEventBusModule } from '../infrastructure/messaging/rabbitmq-event-bus.module';
import { OutboxModule } from '../infrastructure/outbox/outbox.module';
@Module({
  imports: [DatabaseModule, MessaggingModule, RabbitMqEventBusModule, OutboxModule],
})
export class LibsModule {}
