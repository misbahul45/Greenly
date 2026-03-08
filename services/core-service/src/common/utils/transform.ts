import { UserProfile } from "generated/prisma/browser";
import { User } from "generated/prisma/client";
import { MeResponse } from "src/modules/identity/me/types";
import { UserResponse } from "src/modules/identity/users/types";

export function toMeResponse(user: any): MeResponse {
  return {
    id: user.id,
    name: user.name,
    emailVerified: user.emailVerified,

    profile: {
      fullName: user.profile?.fullName ?? null,
      phoneNumber: user.profile?.phoneNumber ?? null,
      address: user.profile?.address ?? null,
      avatarUrl: user.profile?.avatarUrl ?? null,
      photoUrl: user.profile?.photoUrl ?? null,
    },

    roles: user.roles.map(r => r.role.name),

    shop: user.ownedShop.map(shop => ({
      id: shop.id,
      name: shop.name,
      status: shop.status,
    })),

    createdAt: user.createdAt,
  }
}


export function toProfileResponse(profile: any) {
  return {
    id: profile.id,
    fullName: profile.fullName,
    phoneNumber: profile.phoneNumber,
    address: profile.address,
    avatarUrl: profile.avatarUrl,
    photoUrl: profile.photoUrl,
  }
}


export function transformUser(user: any): UserResponse {
  return {
    id: user.id,
    email: user.email,
    name: user.profile?.fullName ?? null,
    status: user.status,
    isActive: user.isActive,
    createdAt: user.createdAt,

    profile: user.profile
      ? {
          fullName: user.profile.fullName ?? null,
          phoneNumber: user.profile.phoneNumber ?? null,
          address: user.profile.address ?? null,
          avatarUrl: user.profile.avatarUrl ?? null,
        }
      : null,
  }
}