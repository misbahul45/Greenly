import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import { Zod } from "#/lib/zod"
import { serverRequest } from "#/lib/request"
import { createCatalogApi } from "#/server/api"
import type { ApiMeta } from "#/types/api.response"

/*
import axios from "axios"
import { useAppSession } from "#/hooks/useSession"

const API_TIMEOUT_MS = 15000

function apiBaseUrl() {
  const coreUrl = process.env.API_URL
  if (coreUrl) {
    return coreUrl.replace(/\/core\/?$/, "")
  }
  return process.env.VITE_API_BASE_URL ?? process.env.API_BASE_URL ?? "http://localhost/api"
}

async function request<T>(
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE",
  path: string,
  data?: any,
  accessToken?: string,
  refreshToken?: string
) {
  const response = await axios({
    method,
    url: `${apiBaseUrl()}${path}`,
    data,
    timeout: API_TIMEOUT_MS,
    headers: {
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      ...(refreshToken && { "x-refresh-token": refreshToken }),
    },
  })

  return response.data as ApiResult<T>
}
*/

type ApiResult<T> = {
  data: T
  meta?: ApiMeta
  metaData?: ApiMeta
  message?: string
}

async function catalogRequest<T>(
  ctx: unknown,
  fn: (api: ReturnType<typeof createCatalogApi>) => Promise<T>
): Promise<T> {
  return serverRequest<T>(ctx, (coreApi) => {
    const headers = coreApi.defaults.headers as Record<string, any>
    const authorization = headers.Authorization ?? headers.common?.Authorization
    const token = authorization?.toString().replace("Bearer ", "")
    return fn(createCatalogApi(token))
  })
}

function cleanParams(obj: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== "" && v !== null)
  )
}

export function firstShopFromPayload(payload: any) {
  const data = payload?.data

  if (Array.isArray(data)) {
    return data[0] ?? null
  }

  if (Array.isArray(data?.data)) {
    return data.data[0] ?? null
  }

  return data?.shop ?? data ?? null
}

export const getMyShopFn = createServerFn({ method: "GET" })
  .handler(async ({ context }) => {
    return serverRequest<any>(context, async (api) => {
      const res = await api.get("/shops/me")
      return res.data
    })
  })

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

const GetSellerProductsSchema = z.object({
  shopId: z.string(),
  page: z.number().optional(),
  limit: z.number().optional(),
  search: z.string().optional(),
})

export const getSellerProductsFn = createServerFn({ method: "GET" })
  .inputValidator(Zod(GetSellerProductsSchema))
  .handler(async ({ data, context }) => {
    return catalogRequest<ApiResult<SellerProduct[]>>(context, async (api) => {
      const params = cleanParams({
        shop_id: data.shopId,
        page: data.page,
        limit: data.limit,
        search: data.search,
      })
      const res = await api.get("/products", { params })
      return { data: res.data?.data ?? [], meta: res.data?.meta }
    })
  })

const ProductPayloadSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  sku: z.string(),
  price: z.number(),
  currency: z.string().default("IDR"),
  stock: z.number(),
  shopId: z.string(),
  categoryId: z.string(),
  imageUrls: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
})

export const createProductFn = createServerFn({ method: "POST" })
  .inputValidator(Zod(ProductPayloadSchema))
  .handler(async ({ data, context }) => {
    return catalogRequest<any>(context, async (api) => {
      const res = await api.post("/products", data)
      return res.data
    })
  })

export const updateProductFn = createServerFn({ method: "POST" })
  .inputValidator(Zod(z.object({ id: z.string(), data: ProductPayloadSchema })))
  .handler(async ({ data, context }) => {
    return catalogRequest<any>(context, async (api) => {
      const res = await api.put(`/products/${data.id}`, data.data)
      return res.data
    })
  })

export const deleteProductFn = createServerFn({ method: "POST" })
  .inputValidator(Zod(z.object({ id: z.string() })))
  .handler(async ({ data, context }) => {
    return catalogRequest<any>(context, async (api) => {
      const res = await api.delete(`/products/${data.id}`)
      return res.data
    })
  })

export const toggleProductFn = createServerFn({ method: "POST" })
  .inputValidator(Zod(z.object({ id: z.string() })))
  .handler(async ({ data, context }) => {
    return catalogRequest<any>(context, async (api) => {
      const res = await api.patch(`/products/${data.id}/toggle`)
      return res.data
    })
  })

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

const GetShopOrdersSchema = z.object({
  shopId: z.string(),
  page: z.number().optional(),
  limit: z.number().optional(),
  status: z.string().optional(),
})

export const getShopOrdersFn = createServerFn({ method: "GET" })
  .inputValidator(Zod(GetShopOrdersSchema))
  .handler(async ({ data, context }) => {
    return serverRequest<ApiResult<SellerOrder[]>>(context, async (api) => {
      const params = cleanParams({
        page: data.page,
        limit: data.limit,
        status: data.status !== "ALL" ? data.status : undefined,
      })
      const res = await api.get(`/orders/shop/${data.shopId}`, { params })
      return {
        data: res.data?.data ?? [],
        meta: res.data?.metaData ?? res.data?.meta,
      }
    })
  })

export const updateOrderStatusFn = createServerFn({ method: "POST" })
  .inputValidator(
    Zod(
      z.object({
        shopId: z.string(),
        orderId: z.string(),
        status: z.enum(["PENDING", "PAID", "PROCESSING", "SHIPPED", "COMPLETED", "CANCELLED"]),
      })
    )
  )
  .handler(async ({ data, context }) => {
    return serverRequest<any>(context, async (api) => {
      const res = await api.patch(`/shops/${data.shopId}/orders/${data.orderId}/status`, {
        status: data.status,
      })
      return res.data
    })
  })

export const getShopBalanceFn = createServerFn({ method: "GET" })
  .inputValidator(Zod(z.object({ shopId: z.string() })))
  .handler(async ({ data, context }) => {
    return serverRequest<any>(context, async (api) => {
      const res = await api.get(`/shops/${data.shopId}/finance/balance`)
      return res.data
    })
  })

export const getShopLedgerFn = createServerFn({ method: "GET" })
  .inputValidator(
    Zod(z.object({ shopId: z.string(), page: z.number().optional(), limit: z.number().optional() }))
  )
  .handler(async ({ data, context }) => {
    return serverRequest<ApiResult<any[]>>(context, async (api) => {
      const params = cleanParams({ page: data.page, limit: data.limit })
      const res = await api.get(`/shops/${data.shopId}/finance/ledger`, { params })
      return {
        data: res.data?.data ?? [],
        meta: res.data?.metaData ?? res.data?.meta,
      }
    })
  })
