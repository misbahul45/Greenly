import { z } from 'zod';

export const AddCartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
});

export type AddCartItemDto = z.infer<typeof AddCartItemSchema>;

export const UpdateCartItemSchema = z.object({
  quantity: z.number().int().positive(),
});

export type UpdateCartItemDto = z.infer<typeof UpdateCartItemSchema>;

export const CartItemParamSchema = z.object({
  productId: z.string().min(1),
});

export type CartItemParamDto = z.infer<typeof CartItemParamSchema>;

export const CartQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CartQueryDto = z.infer<typeof CartQuerySchema>;
