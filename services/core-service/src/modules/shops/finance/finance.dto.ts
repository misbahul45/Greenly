import { z } from "zod";

export const FinanceShopIdParamSchema = z.object({
  shopId: z.coerce.number().int().positive(),
});

export type FinanceShopIdParamDTO =
  z.infer<typeof FinanceShopIdParamSchema>;

export const ledgerTypeEnum = z.enum(["CREDIT", "DEBIT"]);
export type LedgerTypeDTO =
  z.infer<typeof ledgerTypeEnum>;

export const payoutStatusEnum = z.enum([
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
]);

export type PayoutStatusDTO =
  z.infer<typeof payoutStatusEnum>;

export const financeSortOrderEnum = z.enum(["asc", "desc"]);
export type FinanceSortOrder =
  z.infer<typeof financeSortOrderEnum>;

export const LedgerQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),

  limit: z.coerce.number().int().min(1).max(100).default(10),

  type: ledgerTypeEnum.optional(),

  createdFrom: z.coerce.date().optional(),
  createdTo: z.coerce.date().optional(),

  sortBy: z.enum(["createdAt", "amount"]).default("createdAt"),

  sortOrder: financeSortOrderEnum.default("desc"),
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

export type LedgerQueryDTO =
  z.infer<typeof LedgerQuerySchema>;

export const CreatePayoutSchema = z.object({
  amount: z.coerce.number().positive(),
});

export type CreatePayoutDTO =
  z.infer<typeof CreatePayoutSchema>;

export const PayoutQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),

  limit: z.coerce.number().int().min(1).max(100).default(10),

  status: payoutStatusEnum.optional(),

  createdFrom: z.coerce.date().optional(),
  createdTo: z.coerce.date().optional(),

  sortBy: z.enum(["createdAt", "paidAt", "amount"]).default("createdAt"),

  sortOrder: financeSortOrderEnum.default("desc"),
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

export type PayoutQueryDTO =
  z.infer<typeof PayoutQuerySchema>;