import { z } from "zod";

export const ShopMemberShopIdParamSchema = z.object({
  shopId: z.coerce.string(),
});

export type ShopMemberShopIdParamDTO =
  z.infer<typeof ShopMemberShopIdParamSchema>;

export const ShopMemberIdParamSchema = z.object({
  shopId: z.coerce.string(),
  memberId: z.coerce.string(),
});

export type ShopMemberIdParamDTO =
  z.infer<typeof ShopMemberIdParamSchema>;

export const memberRoleEnum = z.enum([
  "OWNER",
  "ADMIN",
  "STAFF",
]);

export type MemberRoleDTO =
  z.infer<typeof memberRoleEnum>;

export const AddMemberSchema = z.object({
  userId: z.string(),
  role: memberRoleEnum,
});

export type AddMemberDTO =
  z.infer<typeof AddMemberSchema>;

export const UpdateMemberRoleSchema = z.object({
  role: memberRoleEnum,
});

export type UpdateMemberRoleDTO =
  z.infer<typeof UpdateMemberRoleSchema>;

  export const ShopMemberQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    role: memberRoleEnum.optional(),
    sortBy: z.enum(["id", "userId", "role", "createdAt"]).default("id"),
    sortOrder: z.enum(["asc", "desc"]).default("asc"),
    search: z.string().optional(),
  });

export type ShopMemberQueryDTO =
  z.infer<typeof ShopMemberQuerySchema>;