import { z } from 'zod';

export const CreatePayoutRequestSchema = z.object({
  amount: z.number().positive(),
  idempotencyKey: z.string().optional(),
});

export type CreatePayoutRequestDto = z.infer<typeof CreatePayoutRequestSchema>;

export const ApprovePayoutSchema = z.object({
  bankReceiptUrl: z.string().url().optional(),
});

export type ApprovePayoutDto = z.infer<typeof ApprovePayoutSchema>;

export const RejectPayoutSchema = z.object({
  reason: z.string().min(5),
});

export type RejectPayoutDto = z.infer<typeof RejectPayoutSchema>;

export const ListPayoutsQuerySchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListPayoutsQueryDto = z.infer<typeof ListPayoutsQuerySchema>;
