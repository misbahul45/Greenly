import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter"),
});

export type LoginSchemaInput = z.infer<typeof LoginSchema>;