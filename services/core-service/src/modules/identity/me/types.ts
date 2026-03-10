import { ShopStatus } from "generated/prisma/enums";

export interface MeResponse {
  id: number;
  name: string;
  emailVerified: Date;

  profile: {
    fullName: string | null;
    phoneNumber: string | null;
    address: string | null;
    avatarUrl: string | null;
    photoUrl: string | null;
  }

  roles: string[];

  shop: {
    id: number;
    name: string | null;
    status: ShopStatus;
  }[];

  createdAt: Date;
}


export interface ProfileResponse {
  id: number;
  fullName: string | null;
  phoneNumber: string | null;
  address: string | null;
  avatarUrl: string | null;
  photoUrl: string | null;
}

export interface ShopResponse {
  id: number;
  name: string | null;
  status: ShopStatus;
  description: string | null;
}