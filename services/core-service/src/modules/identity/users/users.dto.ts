import { z } from 'zod'

export const allowedUserIncludes = [
  'profile',
  'shopMember',
  'roles',
  'cart',
  'orders',
  'notifications',
  'ownedShop',
  'followingShops',
  'events',
  'tokens',
] as const

export const userIncludeEnum = z.enum(allowedUserIncludes)

export const userIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
})

export type UserIdParamDTO = z.infer<typeof userIdParamSchema>

export const userQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  status: z
    .enum(['ACTIVE', 'SUSPENDED', 'BANNED', 'PENDING_VERIFICATION'])
    .optional(),
  include: z
    .string()
    .optional()
    .transform((val) =>
      val ? val.split(',').map((v) => v.trim()) : [],
    )
    .pipe(z.array(userIncludeEnum))
    .optional(),
})

export type UserQueryDTO = z.infer<typeof userQuerySchema>
export type UserInclude = (typeof allowedUserIncludes)[number]

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name:z.string()
})

export type CreateUserDTO = z.infer<typeof createUserSchema>

export const updateUserSchema = z.object({
  status: z
    .enum(['ACTIVE', 'SUSPENDED', 'BANNED', 'PENDING_VERIFICATION'])
    .optional(),
  isActive: z.boolean().optional(),
})

export type UpdateUserDTO = z.infer<typeof updateUserSchema>


export const VerifyDeleteSchema = z.object({
  token: z.string().min(6),
});

export type VerifyDeleteDTO = z.infer<typeof VerifyDeleteSchema>;