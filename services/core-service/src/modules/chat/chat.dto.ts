import { z } from 'zod';

export const CreateConversationSchema = z.object({
  type: z.string().min(1).default('ASSISTANT'),
  title: z.string().min(1).optional(),
});

export const ConversationParamSchema = z.object({
  id: z.string().min(1),
});

export const SendMessageSchema = z.object({
  content: z.string().min(1),
});

export const ChatQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(30),
});

export type CreateConversationDto = z.infer<typeof CreateConversationSchema>;
export type ConversationParamDto = z.infer<typeof ConversationParamSchema>;
export type SendMessageDto = z.infer<typeof SendMessageSchema>;
export type ChatQueryDto = z.infer<typeof ChatQuerySchema>;
