import { z } from "zod";

export const FollowerShopIdParamSchema = z.object({
  shopId: z.coerce.number().int().positive(),
});

export type FollowerShopIdParamDTO =
  z.infer<typeof FollowerShopIdParamSchema>;

export const FollowerQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),

  limit: z.coerce.number().int().min(1).max(100).default(10),

  createdFrom: z.coerce.date().optional(),
  createdTo: z.coerce.date().optional(),

  sortBy: z.enum(["createdAt"]).default("createdAt"),

  sortOrder: z.enum(["asc", "desc"]).default("desc"),
}).refine(
  (data) =>
    !data.createdFrom ||
    !data.createdTo ||
    data.createdFrom <= data.createdTo,
  {
    message: "createdFrom must be before createdTo",
    path: ["createdFrom"],
  }
);

export type FollowerQueryDTO =
  z.infer<typeof FollowerQuerySchema>;

export const MyFollowingQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),

  limit: z.coerce.number().int().min(1).max(100).default(10),

  createdFrom: z.coerce.date().optional(),
  createdTo: z.coerce.date().optional(),

  sortBy: z.enum(["createdAt"]).default("createdAt"),

  sortOrder: z.enum(["asc", "desc"]).default("desc"),
}).refine(
  (data) =>
    !data.createdFrom ||
    !data.createdTo ||
    data.createdFrom <= data.createdTo,
  {
    message: "createdFrom must be before createdTo",
    path: ["createdFrom"],
  }
);

export type MyFollowingQueryDTO =
  z.infer<typeof MyFollowingQuerySchema>;