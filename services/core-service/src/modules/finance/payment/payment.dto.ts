import { z } from 'zod';

export const ListPaymentsQuerySchema = z.object({
  status: z.enum(['PENDING', 'SUCCESS', 'FAILED', 'EXPIRED']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListPaymentsQueryDto = z.infer<typeof ListPaymentsQuerySchema>;

export const UpdatePaymentStatusSchema = z.object({
  status: z.enum(['PENDING', 'SUCCESS', 'FAILED', 'EXPIRED']),
  transactionId: z.string().optional(),
});

export type UpdatePaymentStatusDto = z.infer<typeof UpdatePaymentStatusSchema>;
