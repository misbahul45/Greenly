import { z } from "zod";

export const FollowerShopIdParamSchema = z.object({
  shopId: z.string(),
});

export type FollowerShopIdParamDTO =
  z.infer<typeof FollowerShopIdParamSchema>;

export const FollowerQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  sortBy: z.enum(["createdAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type FollowerQueryDTO =
  z.infer<typeof FollowerQuerySchema>;

export const MyFollowingQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(["createdAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type MyFollowingQueryDTO =
  z.infer<typeof MyFollowingQuerySchema>;