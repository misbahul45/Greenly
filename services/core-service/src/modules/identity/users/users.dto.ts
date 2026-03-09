import { z } from 'zod'


export const userSortFieldEnum = z.enum([
  'createdAt',
  'updatedAt',
  'email',
  'status',
])

export const userSortOrderEnum = z.enum(['asc', 'desc'])


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

  search: z.string().optional(),

  sortBy: userSortFieldEnum.default('createdAt'),
  sortOrder: userSortOrderEnum.default('desc'),

})

export type UserQueryDTO = z.infer<typeof userQuerySchema>

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