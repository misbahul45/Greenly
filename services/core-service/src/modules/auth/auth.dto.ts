import { z } from "zod";

// Register DTO
export const RegisterSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must not exceed 100 characters"),

  email: z
    .string()
    .email("Invalid email format")
    .toLowerCase(),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must not exceed 100 characters"),
});

export type RegisterDTO = z.infer<typeof RegisterSchema>;


// Login DTO
export const LoginSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase(),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

export type LoginDTO = z.infer<typeof LoginSchema>;
