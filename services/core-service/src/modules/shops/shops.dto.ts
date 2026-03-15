import { z } from "zod";

export const ShopIdParamSchema = z.object({
  shopId: z.string(),
});

export type ShopIdParamDTO = z.infer<typeof ShopIdParamSchema>;

export const shopSortFieldEnum = z.enum([
  "createdAt",
  "updatedAt",
  "name",
  "status",
])

export const shopSortOrderEnum = z.enum(["asc", "desc"])

export type ShopSortField = z.infer<typeof shopSortFieldEnum>
export type ShopSortOrder = z.infer<typeof shopSortOrderEnum>

export const ShopQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z
    .enum(["PENDING", "APPROVED", "REJECTED", "SUSPENDED"])
    .optional(),

  ownerId: z.coerce.number().int().positive().optional(),

  createdFrom: z.coerce.date().optional(),
  createdTo: z.coerce.date().optional(),

  sortBy: shopSortFieldEnum.default("createdAt"),
  sortOrder: shopSortOrderEnum.default("desc"),
})

export type ShopQueryDTO = z.infer<typeof ShopQuerySchema>

export const CreateShopSchema = z.object({
  name: z.string().min(3).max(100).trim(),
  description: z
    .string()
    .max(500)
    .trim()
    .optional()
    .transform((val) => (val === "" ? null : val)),
});

export type CreateShopDTO = z.infer<typeof CreateShopSchema>;

export const UpdateShopSchema = z.object({
  name: z.string().min(3).max(100).trim().optional(),
  description: z
    .string()
    .max(500)
    .trim()
    .optional()
    .transform((val) => (val === "" ? null : val)),
});

export type UpdateShopDTO = z.infer<typeof UpdateShopSchema>;