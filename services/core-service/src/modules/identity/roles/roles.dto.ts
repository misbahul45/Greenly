import { z } from 'zod'

export const roleIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
})

export type RoleIdParamDTO = z.infer<typeof roleIdParamSchema>

export const assignRoleParamSchema = z.object({
  roleId: z.coerce.number().int().positive(),
})

export type AssignRoleParamDTO = z.infer<typeof assignRoleParamSchema>

export const createRoleSchema = z.object({
  name: z
    .string()
    .min(2)
    .max(50)
    .transform((val) => val.trim().toUpperCase()),
})

export type CreateRoleDTO = z.infer<typeof createRoleSchema>

export const updateRoleSchema = z.object({
  name: z
    .string()
    .min(2)
    .max(50)
    .transform((val) => val.trim().toUpperCase()),
})

export type UpdateRoleDTO = z.infer<typeof updateRoleSchema>

export const attachPermissionSchema = z.object({
  permissions: z
    .array(
      z.string().min(2).transform((val) => val.trim().toUpperCase()),
    )
    .min(1),
})

export type AttachPermissionDTO = z.infer<typeof attachPermissionSchema>

export const replacePermissionSchema = z.object({
  permissions: z
    .array(
      z.string().min(2).transform((val) => val.trim().toUpperCase()),
    )
    .min(1),
})

export type ReplacePermissionDTO = z.infer<typeof replacePermissionSchema>

export const assignRoleToUserSchema = z.object({
  userId: z.coerce.number().int().positive(),
})

export type AssignRoleToUserDTO = z.infer<typeof assignRoleToUserSchema>

export const removeRoleFromUserSchema = z.object({
  userId: z.coerce.number().int().positive(),
})

export type RemoveRoleFromUserDTO = z.infer<typeof removeRoleFromUserSchema>

export const roleQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  includePermissions: z
    .union([z.literal('true'), z.literal('false')])
    .optional()
    .transform((val) => val === 'true'),
})

export type RoleQueryDTO = z.infer<typeof roleQuerySchema>