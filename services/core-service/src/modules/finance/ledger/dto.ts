import { z } from 'zod';

export const ListLedgersQuerySchema = z.object({
  type: z.enum(['CREDIT', 'DEBIT']).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}).refine(data => {
  if (data.dateFrom && data.dateTo) {
    return new Date(data.dateFrom) <= new Date(data.dateTo);
  }
  return true;
}, {
  message: "dateFrom must be before or equal to dateTo",
  path: ["dateFrom"],
});

export type ListLedgersQueryDto = z.infer<typeof ListLedgersQuerySchema>;


export const CreateLedgerSchema = z.object({
  shopId: z.string().uuid(),
  type: z.enum(['CREDIT', 'DEBIT']),
  amount: z.number().positive(),
  reference: z.string().min(1),
  description: z.string().optional(),
});

export type CreateLedgerDto = z.infer<typeof CreateLedgerSchema>;
