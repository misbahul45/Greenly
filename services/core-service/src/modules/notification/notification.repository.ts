import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../libs/database/database.service';
import { CreateNotificationDto, NotificationQueryDto } from './notification.dto';

@Injectable()
export class NotificationRepository {
  constructor(private readonly db: DatabaseService) {}

  private get prisma() {
    return this.db as any;
  }

  async findMany(userId: string, query: NotificationQueryDto) {
    const skip = (query.page - 1) * query.limit;
    const where = {
      userId,
      ...(query.isRead !== undefined && { isRead: query.isRead }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        lastPage: Math.ceil(total / query.limit),
      },
    };
  }

  async countUnread(userId: string) {
    return this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  async create(dto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        userId: dto.userId,
        title: dto.title,
        message: dto.message,
      },
    });
  }

  async markAsRead(userId: string, id: string) {
    return this.prisma.notification.updateMany({
      where: {
        id,
        userId,
      },
      data: {
        isRead: true,
      },
    });
  }

  async findById(userId: string, id: string) {
    return this.prisma.notification.findFirst({
      where: {
        id,
        userId,
      },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }
}
