import { z } from "zod";

export const ShopIdParamSchema = z.object({ shopId: z.string() });
export type ShopIdParamDTO = z.infer<typeof ShopIdParamSchema>;

export const RecentOrdersQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
});
export type RecentOrdersQueryDTO = z.infer<typeof RecentOrdersQuerySchema>;

export const RevenueQuerySchema = z.object({
  range: z.enum(["7d", "30d", "90d"]).default("30d"),
});
export type RevenueQueryDTO = z.infer<typeof RevenueQuerySchema>;
