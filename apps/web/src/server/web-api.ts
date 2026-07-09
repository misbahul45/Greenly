import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

import { apiRequest, serverRequest } from "#/lib/request"
import { Zod } from "#/lib/zod"
import { createCatalogApi } from "#/server/api"
import type { ApiMeta } from "#/types/api.response"

type ListResponse<T> = {
  data: T[]
  meta?: ApiMeta
}

type ShopStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED"
type ApplicationStatus = "PENDING" | "REVIEW" | "APPROVED" | "REJECTED"
type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "COMPLETED"
  | "CANCELLED"

export type Shop = {
  id: string
  ownerId: string
  name: string
  description: string | null
  status: ShopStatus
  balance?: number
  followerCount: number
  createdAt: string
  updatedAt: string
}

export type ShopApplication = {
  id: string
  shopId: string
  idCardUrl?: string
  selfieUrl?: string | null
  nib?: string | null
  npwp?: string | null
  siupUrl?: string | null
  bankName?: string
  bankAccount?: string
  accountName?: string
  status: ApplicationStatus
  notes?: string | null
  createdAt?: string
  reviewedAt?: string | null
  updatedAt?: string
}

export type Category = {
  id: string
  name: string
  slug: string
  parentId: string | null
  createdAt: string
  updatedAt: string
}

export type Product = {
  id: string
  shopId: string
  categoryId: string
  name: string
  slug: string
  description: string
  sku: string
  favoriteCount: number
  reviewCount: number
  ratingAverage: number
  isActive: boolean
  price: number
  currency: string
  stock: number
  imageUrls: string[]
  categoryName: string
  shopName: string
  createdAt: string
  updatedAt: string
}

export type ShopOrder = {
  id: string
  userId?: string
  shopId?: string
  shopName?: string
  totalAmount: number
  status: OrderStatus
  createdAt: string
  items?: {
    id: string
    productId: string
    productName: string
    price: number
    quantity: number
  }[]
}

export type DashboardSummary = {
  totalOrders: number
  totalRevenue: number
  totalProducts: number
  totalFollowers: number
  balance: number
}

export type RevenueSummary = {
  range: "7d" | "30d" | "90d"
  revenue: {}[]
  total: number
}

const PaginationSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

const ShopListSchema = PaginationSchema.extend({
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "SUSPENDED"]).optional(),
  ownerId: z.string().optional(),
})

const ShopApplicationListSchema = PaginationSchema.extend({
  shopId: z.string(),
  status: z.enum(["PENDING", "REVIEW", "APPROVED", "REJECTED"]).optional(),
})

const ReviewShopApplicationSchema = z.object({
  shopId: z.string(),
  status: z.enum(["PENDING", "REVIEW", "APPROVED", "REJECTED"]),
  notes: z.string().max(500).optional(),
})

const ProductListSchema = PaginationSchema.extend({
  shop_id: z.string().optional(),
  category_id: z.string().optional(),
  is_active: z.boolean().optional(),
})

const SaveProductSchema = z.object({
  id: z.string().optional(),
  shopId: z.string(),
  categoryId: z.string(),
  name: z.string(),
  slug: z.string().optional(),
  description: z.string().optional(),
  sku: z.string(),
  price: z.number(),
  currency: z.string().default("IDR"),
  stock: z.number(),
  imageUrls: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
})

const ShopOrdersSchema = PaginationSchema.extend({
  shopId: z.string(),
  status: z
    .enum(["PENDING", "PAID", "PROCESSING", "SHIPPED", "COMPLETED", "CANCELLED"])
    .optional(),
})

const UpdateShopOrderStatusSchema = z.object({
  shopId: z.string(),
  orderId: z.string(),
  status: z.enum(["PENDING", "PAID", "PROCESSING", "SHIPPED", "COMPLETED", "CANCELLED"]),
})

const ShopIdSchema = z.object({
  shopId: z.string(),
})

const ShopRevenueSchema = z.object({
  shopId: z.string(),
  range: z.enum(["7d", "30d", "90d"]).optional(),
})

function cleanParams<T extends Record<string, unknown>>(params: T) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== "")
  )
}

async function catalogRequest<T>(
  ctx: unknown,
  fn: (api: ReturnType<typeof createCatalogApi>) => Promise<T>
) {
  return serverRequest<T>(ctx, (coreApi) => {
    const headers = coreApi.defaults.headers as Record<string, any>
    const authorization =
      headers.Authorization ?? headers.common?.Authorization
    const token = authorization?.toString().replace("Bearer ", "")

    return fn(createCatalogApi(token))
  })
}

export const listShopsFn = createServerFn({ method: "GET" })
  .inputValidator(Zod(ShopListSchema))
  .handler(async ({ data, context }) => {
    return serverRequest<ListResponse<Shop>>(context, async (api) => {
      const res = await api.get("/shops", { params: cleanParams(data) })
      return {
        data: res.data.data ?? [],
        meta: res.data.metaData,
      }
    })
  })

export const listMyShopsFn = createServerFn({ method: "GET" })
  .inputValidator(Zod(PaginationSchema))
  .handler(async ({ data, context }) => {
    return serverRequest<ListResponse<Shop>>(context, async (api) => {
      const res = await api.get("/shops/me", { params: cleanParams(data) })
      return {
        data: res.data.data ?? [],
        meta: res.data.metaData,
      }
    })
  })

export const listShopApplicationsFn = createServerFn({ method: "GET" })
  .inputValidator(Zod(ShopApplicationListSchema))
  .handler(async ({ data, context }) => {
    return serverRequest<ListResponse<ShopApplication>>(context, async (api) => {
      const { shopId, ...params } = data
      const res = await api.get(`/shops/${shopId}/application/list`, {
        params: cleanParams(params),
      })
      return {
        data: res.data.data ?? [],
        meta: res.data.metaData,
      }
    })
  })

export const reviewShopApplicationFn = createServerFn({ method: "POST" })
  .inputValidator(Zod(ReviewShopApplicationSchema))
  .handler(async ({ data, context }) => {
    await serverRequest<{}>(context, (api) =>
      apiRequest(
        api.patch(`/shops/${data.shopId}/application/review`, {
          status: data.status,
          notes: data.notes,
        })
      )
    )

    return {}
  })

export const listCategoriesFn = createServerFn({ method: "GET" })
  .inputValidator(Zod(PaginationSchema))
  .handler(async ({ data, context }) => {
    return catalogRequest<ListResponse<Category>>(context, async (api) => {
      const res = await api.get("/categories", { params: cleanParams(data) })
      return {
        data: res.data.data ?? [],
        meta: res.data.meta,
      }
    })
  })

export const listProductsFn = createServerFn({ method: "GET" })
  .inputValidator(Zod(ProductListSchema))
  .handler(async ({ data, context }) => {
    return catalogRequest<ListResponse<Product>>(context, async (api) => {
      const res = await api.get("/products", { params: cleanParams(data) })
      return {
        data: res.data.data ?? [],
        meta: res.data.meta,
      }
    })
  })

export const saveProductFn = createServerFn({ method: "POST" })
  .inputValidator(Zod(SaveProductSchema))
  .handler(async ({ data, context }) => {
    await catalogRequest<{}>(context, (api) => {
      if (data.id) {
        const { id, ...payload } = data
        return apiRequest(api.put(`/products/${id}`, payload))
      }

      return apiRequest(api.post("/products", data))
    })

    return {}
  })

export const listShopOrdersFn = createServerFn({ method: "GET" })
  .inputValidator(Zod(ShopOrdersSchema))
  .handler(async ({ data, context }) => {
    return serverRequest<ListResponse<ShopOrder>>(context, async (api) => {
      const { shopId, ...params } = data
      const res = await api.get(`/shops/${shopId}/orders`, {
        params: cleanParams(params),
      })
      return {
        data: res.data.data ?? [],
        meta: res.data.metaData,
      }
    })
  })

export const updateShopOrderStatusFn = createServerFn({ method: "POST" })
  .inputValidator(Zod(UpdateShopOrderStatusSchema))
  .handler(async ({ data, context }) => {
    await serverRequest<{}>(context, (api) =>
      apiRequest(
        api.patch(`/shops/${data.shopId}/orders/${data.orderId}/status`, {
          status: data.status,
        })
      )
    )

    return {}
  })

export const getShopDashboardSummaryFn = createServerFn({ method: "GET" })
  .inputValidator(Zod(ShopIdSchema))
  .handler(async ({ data, context }) => {
    return serverRequest<DashboardSummary>(context, (api) =>
      apiRequest(api.get(`/shops/${data.shopId}/dashboard/summary`))
    )
  })

export const getShopRevenueFn = createServerFn({ method: "GET" })
  .inputValidator(Zod(ShopRevenueSchema))
  .handler(async ({ data, context }) => {
    return serverRequest<RevenueSummary>(context, (api) =>
      apiRequest(
        api.get(`/shops/${data.shopId}/dashboard/revenue`, {
          params: cleanParams({ range: data.range }),
        })
      )
    )
  })
