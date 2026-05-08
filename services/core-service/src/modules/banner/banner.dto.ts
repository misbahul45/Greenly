import { z } from 'zod'

const BannerTypeValues = ['HOME', 'PROMO', 'EVENT'] as const
type BannerType = typeof BannerTypeValues[number]

export const BannerIdParamSchema = z.object({
  id: z.string(),
})

export type BannerIdParamDTO = z.infer<typeof BannerIdParamSchema>

export const BannerQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  type: z.enum(BannerTypeValues).optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'position', 'updatedAt']).default('position'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
})

export type BannerQueryDTO = z.infer<typeof BannerQuerySchema>

export const CreateBannerSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  description: z.string().max(500).trim().optional(),
  imageUrl: z.string().url(),
  promotionId: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  position: z.number().int().min(0).optional().nullable(),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
  type: z.enum(BannerTypeValues).default('HOME'),
})

export type CreateBannerDTO = z.infer<typeof CreateBannerSchema>

export const UpdateBannerSchema = CreateBannerSchema.partial()

export type UpdateBannerDTO = z.infer<typeof UpdateBannerSchema>
