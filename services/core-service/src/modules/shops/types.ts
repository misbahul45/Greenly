import { ShopStatus } from "../../../generated/prisma/enums"

export interface ShopFilters {
  search?: string
  status?: ShopStatus
  ownerId?: string
  createdFrom?: Date
  createdTo?: Date
}

export interface ShopQueryParams extends ShopFilters {
  skip: number
  take: number
  sortBy: string
  sortOrder: "asc" | "desc"
}

export interface ShopOwner {
  email: string
  fullName?: string | null
  avatarUrl?: string | null
}

export interface ShopCreatedEvent {
  shopId: string
  ownerId: string
  name: string
  status: ShopStatus
  timestamp: string
  correlationId: string
}

export interface ShopWithOwner {
  id: string
  ownerId: string
  name: string
  description: string | null
  status: ShopStatus
  balance: unknown
  followerCount: number
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
  owner: ShopOwner
}
