import { z } from "zod";
import { ShopIdParamSchema } from "../shops.dto";

export const OrderIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type OrderIdParamDTO =
  z.infer<typeof OrderIdParamSchema>;

export const orderStatusEnum = z.enum([
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "COMPLETED",
  "CANCELLED",
]);

export type OrderStatusDTO =
  z.infer<typeof orderStatusEnum>;

export const orderSortFieldEnum = z.enum([
  "createdAt",
  "totalAmount",
  "status",
]);

export const orderSortOrderEnum = z.enum(["asc", "desc"]);

export type OrderSortField =
  z.infer<typeof orderSortFieldEnum>;

export type OrderSortOrder =
  z.infer<typeof orderSortOrderEnum>;

export const OrderQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: orderStatusEnum.optional(),
  createdFrom: z.coerce.date().optional(),
  createdTo: z.coerce.date().optional(),
  sortBy: orderSortFieldEnum.default("createdAt"),
  sortOrder: orderSortOrderEnum.default("desc"),
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

export type OrderQueryDTO =
  z.infer<typeof OrderQuerySchema>;

export const CreateOrderItemSchema = z.object({
  productId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().positive(),
});

export const CreateOrderSchema = z.object({
  shopId: z.coerce.number().int().positive(),
  items: z.array(CreateOrderItemSchema).min(1),
});

export type CreateOrderDTO =
  z.infer<typeof CreateOrderSchema>;

export const UpdateOrderStatusSchema = z.object({
  status: orderStatusEnum,
});

export type UpdateOrderStatusDTO =
  z.infer<typeof UpdateOrderStatusSchema>;


export const RefundParamSchema = ShopIdParamSchema
  .merge(OrderIdParamSchema)
  .merge(
    z.object({
      refundId: z.coerce.number().int().positive(),
    }),
  );

export type RefundParamDTO = z.infer<typeof RefundParamSchema>;