import {z} from "zod";

export const CheckoutSchema = z.object({
    shopId: z.string().min(1),
    shopName: z.string().min(1),
    itemIds: z.array(z.string().min(1)).min(1),
    paymentMethod: z.enum(["STRIPE"]),
    promoCode: z.string().optional(),
    shippingAddress: z.string().min(1).optional(),
    items: z
        .array(
            z.object({
                productId: z.string().min(1),
                productName: z.string().min(1),
                price: z.coerce.number().nonnegative(),
                quantity: z.coerce.number().int().positive(),
            })
        )
        .optional(),
});

export type CheckoutDto = z.infer<typeof CheckoutSchema>;
