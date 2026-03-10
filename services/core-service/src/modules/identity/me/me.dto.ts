import { email } from "node_modules/zod/v4/core/regexes";
import { z } from "zod";

export const UpdateProfileSchema = z.object({
  name: z
    .string()
    .min(3, "Name minimal 3 karakter")
    .max(100, "Name maksimal 100 karakter")
    .optional(),

  phone: z
    .string()
    .min(8, "Nomor telepon tidak valid")
    .max(20)
    .optional(),

  avatarUrl: z
    .string()
    .url("Avatar harus berupa URL valid")
    .optional(),
  
  photoUrl: z
    .string()
    .url("Avatar harus berupa URL valid")
    .optional(),
  
  address: z
    .string()
    .max(255)
    .optional(),
});

export type UpdateProfileDTO = z.infer<typeof UpdateProfileSchema>


export const UserFollowingShopSchema = z.object({
  page: z.coerce.number().int().positive().default(1),

  limit: z.coerce.number().int().min(1).max(100).default(10),

  shopId: z.string(),

  search: z.string().optional(),

  createdFrom: z.coerce.date().optional(),

  createdTo: z.coerce.date().optional(),

  sortBy: z.enum(["createdAt"]).default("createdAt"),

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

export type UserFollowingShopDTO = z.infer<typeof UserFollowingShopSchema>;