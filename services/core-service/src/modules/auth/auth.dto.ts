import { z } from "zod";


export const RegisterSchema = z.object({
  name: z
    .string()
    .min(3)
    .max(100)
    .trim(),

  email: z
    .string()
    .email()
    .toLowerCase(),

  password: z
    .string()
    .min(8)
    .max(100),
  confirmPassword: z
    .string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Password dan konfirmasi password harus sama",
    path: ["confirmPassword"], 
  });;

export type RegisterDTO = z.infer<typeof RegisterSchema>;


export const LoginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
});

export type LoginDTO = z.infer<typeof LoginSchema>;



export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(10),
});

export type RefreshTokenDTO = z.infer<typeof RefreshTokenSchema>;

export const VerifyEmailSchema = z.object({
  token: z.string().min(6),
});

export type VerifyEmailDTO = z.infer<typeof VerifyEmailSchema>;


export const VerifyPasswordSchema = z.object({
  token: z.string().min(6),
});

export type VerifyPasswordDTO = z.infer<typeof VerifyPasswordSchema>;

export const ForgotPasswordSchema = z.object({
  email: z.string().email().toLowerCase(),
});

export type ForgotPasswordDTO = z.infer<typeof ForgotPasswordSchema>;


export const ChangePasswordSchema = z.object({
  tokenId:z.string(),
  newPassword: z
    .string()
    .min(8)
    .max(100),
  confirmNewPassword: z
    .string()
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Passwords do not match',
  path: ['confirmNewPassword'],
});

export type ChangePasswordDTO = z.infer<typeof ChangePasswordSchema>;


export const GenerateTokensSchema = z.object({
  sub: z.string(),
  email: z.string().email(),
  roles: z.array(z.string()),
});

export type GenerateTokensDTO =  z.infer<typeof GenerateTokensSchema>;


export const ResendTokenSchema = z.object({
  email: z.string().email().toLowerCase(),
})


export type ResendTokenDTO =  z.infer<typeof ResendTokenSchema>;
