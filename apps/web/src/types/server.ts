export type AdminUser = {
  id: string
  email: string
  name: string | null
  status: "ACTIVE" | "SUSPENDED" | "BANNED" | "PENDING_VERIFICATION"
  isActive: boolean
  createdAt: string
  roles: { role: { id: string; name: string } }[]
  profile: {
    fullName: string | null
    phone: string | null
    address: string | null
    avatarUrl: string | null
  } | null
}

export type AdminShop = {
  id: string
  ownerId: string
  name: string
  description: string | null
  status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED"
  balance: number
  createdAt: string
  owner: {
    email: string
    profile?: {
      fullName: string
    }
  }
}

export type ShopApplication = {
  id: string
  shopId: string
  shop: {
    name: string
    owner: {
      email: string
      profile?: {
        fullName: string
      }
    }
  }
  status: "PENDING" | "REVIEW" | "APPROVED" | "REJECTED"
  createdAt: string
  reviewedAt?: string | null
  notes?: string | null
  idCardUrl: string
  bankName: string
  bankAccount: string
  accountName: string
}

export type AdminCategory = {
  id: string
  name: string
  slug: string
  parentId: string | null
  createdAt: string
  updatedAt: string
}

export type AdminOrder = {
  id: string
  userId: string
  shopId: string
  shopName: string
  totalAmount: number
  status: "PENDING" | "PAID" | "PROCESSING" | "SHIPPED" | "COMPLETED" | "CANCELLED"
  createdAt: string
  user: {
    email: string
    profile: {
      fullName: string
    }
  }
}

export type SellerProduct = {
  id: string
  name: string
  slug: string
  description: string
  price: number
  stock: number
  shopId: string
  categoryId: string
  imageUrls: string[]
  images: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type SellerOrder = {
  id: string
  shopName: string
  totalAmount: number
  status: "PENDING" | "PAID" | "PROCESSING" | "SHIPPED" | "COMPLETED" | "CANCELLED"
  createdAt: string
  items: {
    id: string
    productId: string
    productName: string
    price: number
    quantity: number
  }[]
}

export type SellerShop = {
  id: string
  name: string
  status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED"
  description: string | null
  followerCount: number
  createdAt: string
  updatedAt: string
}
