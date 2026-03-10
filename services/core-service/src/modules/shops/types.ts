import { Prisma } from "../../../generated/prisma/browser"
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
  sortBy: keyof Prisma.ShopOrderByWithRelationInput
  sortOrder: Prisma.SortOrder
}
export interface ShopOwner {
  email: string
  fullName?: string | null
  avatarUrl?: string | null
}


