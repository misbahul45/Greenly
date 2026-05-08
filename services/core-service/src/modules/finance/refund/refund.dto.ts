import { z } from 'zod';

export const ListRefundsQuerySchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type ListRefundsQueryDto = z.infer<typeof ListRefundsQuerySchema>;

export const CreateRefundSchema = z.object({
  paymentId: z.string().uuid(),
  amount: z.number().positive(),
  reason: z.string().min(5),
});
export type CreateRefundDto = z.infer<typeof CreateRefundSchema>;

export const ApproveRefundSchema = z.object({
  notes: z.string().optional(),
});
export type ApproveRefundDto = z.infer<typeof ApproveRefundSchema>;

export const ForceRefundSchema = z.object({
  reason: z.string().min(5),
});
export type ForceRefundDto = z.infer<typeof ForceRefundSchema>;
