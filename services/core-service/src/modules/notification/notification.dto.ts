import { z } from 'zod';

export const NotificationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  isRead: z.coerce.boolean().optional(),
});

export const NotificationParamSchema = z.object({
  id: z.string().min(1),
});

export const CreateNotificationSchema = z.object({
  userId: z.string().min(1),
  title: z.string().min(1),
  message: z.string().min(1),
});

export type NotificationQueryDto = z.infer<typeof NotificationQuerySchema>;
export type NotificationParamDto = z.infer<typeof NotificationParamSchema>;
export type CreateNotificationDto = z.infer<typeof CreateNotificationSchema>;
