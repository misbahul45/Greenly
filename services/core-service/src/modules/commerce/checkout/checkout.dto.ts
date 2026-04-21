import { z } from 'zod';

export const CheckoutSchema = z.object({
  shopId: z.string().min(1),
  shopName: z.string().min(1),
  itemIds: z.array(z.string().min(1)).min(1),
  paymentMethod: z.string().min(1),
  promoCode: z.string().optional(),
});

export type CheckoutDto = z.infer<typeof CheckoutSchema>;
