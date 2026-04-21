import { z } from 'zod';

export const FinanceOverviewQuerySchema = z.object({
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

export type FinanceOverviewQueryDto = z.infer<typeof FinanceOverviewQuerySchema>;

export interface UserPayload {
  sub: string;
  id?: string;
  email?: string;
  roles?: string[];
}
