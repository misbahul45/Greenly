import { z } from 'zod';

export const OrderQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED']).optional(),
  shopId: z.string().optional(),
});

export type OrderQueryDto = z.infer<typeof OrderQuerySchema>;

export const OrderIdParamSchema = z.object({
  orderId: z.string().min(1),
});

export type OrderIdParamDto = z.infer<typeof OrderIdParamSchema>;

export const UpdateOrderStatusSchema = z.object({
  status: z.enum(['PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED']),
});

export type UpdateOrderStatusDto = z.infer<typeof UpdateOrderStatusSchema>;

export const PaymentCallbackSchema = z.object({
  orderId: z.string().min(1),
  transactionId: z.string().min(1),
  status: z.enum(['SUCCESS', 'FAILED', 'EXPIRED']),
  grossAmount: z.string(),
  method: z.string(),
  paidAt: z.string().optional(),
});

export type PaymentCallbackDto = z.infer<typeof PaymentCallbackSchema>;

export const CreateRefundSchema = z.object({
  paymentId: z.string().min(1),
  amount: z.string().min(1),
  reason: z.string().min(1),
});

export type CreateRefundDto = z.infer<typeof CreateRefundSchema>;
