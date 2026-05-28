import { Body, Controller, Get, Param, Patch, Post, Query, Sse } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../libs/pipes/zod-validation.pipe';
import ErrorHandler from '../../libs/errors/handler.error';
import { NotificationService } from './notification.service';
import {
  CreateNotificationSchema,
  NotificationParamSchema,
  NotificationQuerySchema,
} from './notification.dto';
import type {
  CreateNotificationDto,
  NotificationParamDto,
  NotificationQueryDto,
} from './notification.dto';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  findMany(
    @CurrentUser() user: UserLogin,
    @Query(new ZodValidationPipe(NotificationQuerySchema)) query: NotificationQueryDto,
  ) {
    return ErrorHandler(() => this.notificationService.findMany(user.sub, query));
  }

  @Get('unread-count')
  unreadCount(@CurrentUser() user: UserLogin) {
    return ErrorHandler(() => this.notificationService.unreadCount(user.sub));
  }

  @Sse('stream')
  stream(@CurrentUser() user: UserLogin) {
    return this.notificationService.stream(user.sub);
  }

  @Post()
  create(
    @Body(new ZodValidationPipe(CreateNotificationSchema)) dto: CreateNotificationDto,
  ) {
    return ErrorHandler(() => this.notificationService.create(dto));
  }

  @Patch('read-all')
  markAllAsRead(@CurrentUser() user: UserLogin) {
    return ErrorHandler(() => this.notificationService.markAllAsRead(user.sub));
  }

  @Patch(':id/read')
  markAsRead(
    @CurrentUser() user: UserLogin,
    @Param(new ZodValidationPipe(NotificationParamSchema)) params: NotificationParamDto,
  ) {
    return ErrorHandler(() => this.notificationService.markAsRead(user.sub, params.id));
  }
}
