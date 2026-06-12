import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationRealtime } from './notification.realtime';
import { NotificationRepository } from './notification.repository';
import { NotificationService } from './notification.service';

@Module({
  controllers: [NotificationController],
  providers: [NotificationService, NotificationRepository, NotificationRealtime],
  exports: [NotificationService],
})
export class NotificationModule {}
