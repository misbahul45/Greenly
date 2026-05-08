import { z } from 'zod';
import { PromotionType } from '../../../generated/prisma/enums';

export const CartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1),
  price: z.number().min(0),
});

export const CreatePromotionSchema = z.object({
  code: z.string().min(1).toUpperCase(),
  name: z.string().min(1),
  description: z.string().optional(),
  discountVal: z.number().min(0),
  type: z.nativeEnum(PromotionType),
  minPurchaseAmount: z.number().min(0).optional(),
  maxDiscountAmount: z.number().min(0).optional(),
  usageLimit: z.number().int().min(1).optional(),
  userLimit: z.number().int().min(1).optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  isActive: z.boolean().optional().default(true),
  applicableShopIds: z.array(z.string()).optional().default([]),
  applicableProductIds: z.array(z.string()).optional().default([]),
});

export const UpdatePromotionSchema = CreatePromotionSchema.partial();

export const ValidatePromoQuerySchema = z.object({
  code: z.string().min(1),
  shopId: z.string().optional(),
  cartTotal: z.number().min(0),
  items: z.array(CartItemSchema).optional(),
});

export const ApplyPromotionInputSchema = z.object({
  code: z.string().min(1),
  userId: z.string().min(1),
  shopId: z.string().min(1),
  cartTotal: z.number().min(0),
});

export const ListPromotionsQuerySchema = z.object({
  shopId: z.string().optional(),
  type: z.nativeEnum(PromotionType).optional(),
  isActive: z.boolean().optional(),
  startDateFrom: z.string().datetime().optional(),
  startDateTo: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
  sortBy: z.enum(['createdAt', 'startDate', 'discountVal']).optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type CartItemDto = z.infer<typeof CartItemSchema>;
export type CreatePromotionDto = z.infer<typeof CreatePromotionSchema>;
export type UpdatePromotionDto = z.infer<typeof UpdatePromotionSchema>;
export type ValidatePromoQueryDto = z.infer<typeof ValidatePromoQuerySchema>;
export type ApplyPromotionInputDto = z.infer<typeof ApplyPromotionInputSchema>;
export type ListPromotionsQueryDto = z.infer<typeof ListPromotionsQuerySchema>;

export interface UserPayload {
  sub: string;
  id?: string;
  email?: string;
  roles?: string[];
}
