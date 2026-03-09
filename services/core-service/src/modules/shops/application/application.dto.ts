import { z } from "zod";

export const ShopApplicationShopIdParamSchema = z.object({
  shopId: z.coerce.number().int().positive(),
});

export type ShopApplicationShopIdParamDTO =
  z.infer<typeof ShopApplicationShopIdParamSchema>;

export const applicationStatusEnum = z.enum([
  "PENDING",
  "REVIEW",
  "APPROVED",
  "REJECTED",
]);

export type ApplicationStatusDTO =
  z.infer<typeof applicationStatusEnum>;

export const CreateShopApplicationSchema = z.object({
  idCardUrl: z.string().url().trim(),

  selfieUrl: z
    .string()
    .url()
    .trim()
    .optional()
    .transform((val) => (val === "" ? null : val)),

  nib: z
    .string()
    .max(50)
    .trim()
    .optional()
    .transform((val) => (val === "" ? null : val)),

  npwp: z
    .string()
    .max(50)
    .trim()
    .optional()
    .transform((val) => (val === "" ? null : val)),

  siupUrl: z
    .string()
    .url()
    .trim()
    .optional()
    .transform((val) => (val === "" ? null : val)),

  bankName: z.string().min(2).max(100).trim(),

  bankAccount: z
    .string()
    .min(5)
    .max(30)
    .trim(),

  accountName: z.string().min(2).max(100).trim(),
});

export type CreateShopApplicationDTO =
  z.infer<typeof CreateShopApplicationSchema>;

export const ReviewShopApplicationSchema = z.object({
  status: applicationStatusEnum,

  notes: z
    .string()
    .max(500)
    .trim()
    .optional()
    .transform((val) => (val === "" ? null : val)),
});

export type ReviewShopApplicationDTO =
  z.infer<typeof ReviewShopApplicationSchema>;

export const ShopApplicationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),

  limit: z.coerce.number().int().min(1).max(100).default(10),

  status: applicationStatusEnum.optional(),

  shopId: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),

  createdFrom: z.coerce.date().optional(),
  createdTo: z.coerce.date().optional(),

  sortBy: z.enum(["createdAt", "updatedAt", "status"]).default("createdAt"),

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

export type ShopApplicationQueryDTO =
  z.infer<typeof ShopApplicationQuerySchema>;