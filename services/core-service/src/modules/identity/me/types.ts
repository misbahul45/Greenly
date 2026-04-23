import { ShopStatus } from "generated/prisma/enums";

export interface MeResponse {
  id: string;
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
    id: string;
    name: string | null;
    status: ShopStatus;
  }[];

  createdAt: Date;
}


export interface ProfileResponse {
  id: string;
  fullName: string | null;
  phoneNumber: string | null;
  address: string | null;
  avatarUrl: string | null;
  photoUrl: string | null;
}

export interface ShopResponse {
  id: string;
  name: string | null;
  status: ShopStatus;
  description: string | null;
}