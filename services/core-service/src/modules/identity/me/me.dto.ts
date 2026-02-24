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

  address: z
    .string()
    .max(255)
    .optional(),
});

export type UpdateProfileDTO=z.infer<typeof UpdateProfileSchema>