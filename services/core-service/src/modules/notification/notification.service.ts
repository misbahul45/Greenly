import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNotificationDto, NotificationQueryDto } from './notification.dto';
import { NotificationRealtime } from './notification.realtime';
import { NotificationRepository } from './notification.repository';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepo: NotificationRepository,
    private readonly notificationRealtime: NotificationRealtime,
  ) {}

  async findMany(userId: string, query: NotificationQueryDto) {
    const result = await this.notificationRepo.findMany(userId, query);

    return {
      data: result.data,
      meta: result.meta,
      message: 'Notifications fetched successfully',
    };
  }

  async unreadCount(userId: string) {
    const count = await this.notificationRepo.countUnread(userId);

    return {
      data: { count },
      message: 'Unread notification count fetched successfully',
    };
  }

  async create(dto: CreateNotificationDto) {
    const notification = await this.notificationRepo.create(dto);
    const unreadCount = await this.notificationRepo.countUnread(dto.userId);

    this.notificationRealtime.emit(dto.userId, 'notification.created', {
      notification,
      unreadCount,
    });

    return {
      data: notification,
      message: 'Notification created successfully',
    };
  }

  async markAsRead(userId: string, id: string) {
    const notification = await this.notificationRepo.findById(userId, id);
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    await this.notificationRepo.markAsRead(userId, id);
    const updated = await this.notificationRepo.findById(userId, id);
    const unreadCount = await this.notificationRepo.countUnread(userId);

    this.notificationRealtime.emit(userId, 'notification.read', {
      notification: updated,
      unreadCount,
    });

    return {
      data: updated,
      message: 'Notification marked as read',
    };
  }

  async markAllAsRead(userId: string) {
    await this.notificationRepo.markAllAsRead(userId);
    const unreadCount = await this.notificationRepo.countUnread(userId);

    this.notificationRealtime.emit(userId, 'notification.read_all', {
      unreadCount,
    });

    return {
      data: { unreadCount },
      message: 'Notifications marked as read',
    };
  }

  stream(userId: string) {
    return this.notificationRealtime.stream(userId);
  }
}
