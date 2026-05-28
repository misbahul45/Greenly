import { z } from 'zod';

export const ListPaymentsQuerySchema = z.object({
  status: z.enum(['PENDING', 'SUCCESS', 'FAILED', 'EXPIRED', 'REFUNDED']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListPaymentsQueryDto = z.infer<typeof ListPaymentsQuerySchema>;

export const UpdatePaymentStatusSchema = z.object({
  status: z.enum(['PENDING', 'SUCCESS', 'FAILED', 'EXPIRED', 'REFUNDED']),
  transactionId: z.string().optional(),
});

export type UpdatePaymentStatusDto = z.infer<typeof UpdatePaymentStatusSchema>;

export const CreateStripeIntentSchema = z.object({
  orderId: z.string().min(1),
});

export type CreateStripeIntentDto = z.infer<typeof CreateStripeIntentSchema>;
