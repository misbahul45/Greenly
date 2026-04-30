import { z } from 'zod'

export const ShopBannerShopIdParamSchema = z.object({
  shopId: z.string(),
})

export type ShopBannerShopIdParamDTO = z.infer<typeof ShopBannerShopIdParamSchema>

export const ShopBannerIdParamSchema = z.object({
  shopId: z.string(),
  id: z.string(),
})

export type ShopBannerIdParamDTO = z.infer<typeof ShopBannerIdParamSchema>

export const ShopBannerQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  isActive: z.coerce.boolean().optional(),
  sortBy: z.enum(['createdAt', 'position', 'updatedAt']).default('position'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
})

export type ShopBannerQueryDTO = z.infer<typeof ShopBannerQuerySchema>

export const CreateShopBannerSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  description: z.string().max(500).trim().optional(),
  imageUrl: z.string().url(),
  isActive: z.boolean().default(true),
  position: z.number().int().min(0).optional().nullable(),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
})

export type CreateShopBannerDTO = z.infer<typeof CreateShopBannerSchema>

export const UpdateShopBannerSchema = CreateShopBannerSchema.partial()

export type UpdateShopBannerDTO = z.infer<typeof UpdateShopBannerSchema>
