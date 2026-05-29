import axios from "axios"
import { createServerFn } from "@tanstack/react-start"
import { useAppSession } from "#/hooks/useSession"
import { z } from "zod"
import { Zod } from "#/lib/zod"

type ApiResult<T> = {
  data: T
  meta?: {
    total?: number
    page?: number
    limit?: number
    lastPage?: number
  }
  message?: string
}

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
    headers: {
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      ...(refreshToken && { "x-refresh-token": refreshToken }),
    },
  })

  return response.data as ApiResult<T>
}

export const getMyShopFn = createServerFn({ method: "GET" })
  .handler(async () => {
    const session = await useAppSession()
    const accessToken = session.data?.accessToken
    const refreshToken = session.data?.refreshToken

    return request<any>("GET", "/core/shops/me", null, accessToken, refreshToken)
  })

// PRODUCTS
export type SellerProduct = {
  id: string
  name: string
  slug: string
  description: string
  price: number
  stock: number
  shopId: string
  categoryId: string
  images: string[]
  isActive: boolean
  createdAt: string
}

const GetSellerProductsSchema = z.object({
  shopId: z.string(),
  page: z.number().optional(),
  limit: z.number().optional(),
  search: z.string().optional(),
})

export const getSellerProductsFn = createServerFn({ method: "GET" })
  .inputValidator(Zod(GetSellerProductsSchema))
  .handler(async ({ data }) => {
    const session = await useAppSession()
    const accessToken = session.data?.accessToken
    const refreshToken = session.data?.refreshToken

    const query = new URLSearchParams()
    query.append("shop_id", data.shopId)
    if (data.page) query.append("page", data.page.toString())
    if (data.limit) query.append("limit", data.limit.toString())
    if (data.search) query.append("search", data.search)

    return request<SellerProduct[]>("GET", `/catalog/products?${query.toString()}`, null, accessToken, refreshToken)
  })

export const createProductFn = createServerFn({ method: "POST" })
  .inputValidator((d: any) => d)
  .handler(async ({ data }: { data: any }) => {
    const session = await useAppSession()
    const accessToken = session.data?.accessToken
    const refreshToken = session.data?.refreshToken

    return request<SellerProduct>("POST", `/catalog/products`, data, accessToken, refreshToken)
  })

export const updateProductFn = createServerFn({ method: "POST" })
  .inputValidator(Zod(z.object({ id: z.string(), data: z.any() })))
  .handler(async ({ data }) => {
    const session = await useAppSession()
    const accessToken = session.data?.accessToken
    const refreshToken = session.data?.refreshToken

    return request<SellerProduct>("PUT", `/catalog/products/${data.id}`, data.data, accessToken, refreshToken)
  })

export const deleteProductFn = createServerFn({ method: "POST" })
  .inputValidator(Zod(z.object({ id: z.string() })))
  .handler(async ({ data }) => {
    const session = await useAppSession()
    const accessToken = session.data?.accessToken
    const refreshToken = session.data?.refreshToken

    return request<any>("DELETE", `/catalog/products/${data.id}`, null, accessToken, refreshToken)
  })

export const toggleProductFn = createServerFn({ method: "POST" })
  .inputValidator(Zod(z.object({ id: z.string() })))
  .handler(async ({ data }) => {
    const session = await useAppSession()
    const accessToken = session.data?.accessToken
    const refreshToken = session.data?.refreshToken

    return request<any>("PATCH", `/catalog/products/${data.id}/toggle`, null, accessToken, refreshToken)
  })

// ORDERS
export type SellerOrder = {
  id: string
  shopName: string
  totalAmount: number
  status: string
  createdAt: string
  items: any[]
}

const GetShopOrdersSchema = z.object({
  shopId: z.string(),
  page: z.number().optional(),
  limit: z.number().optional(),
  status: z.string().optional(),
})

export const getShopOrdersFn = createServerFn({ method: "GET" })
  .inputValidator(Zod(GetShopOrdersSchema))
  .handler(async ({ data }) => {
    const session = await useAppSession()
    const accessToken = session.data?.accessToken
    const refreshToken = session.data?.refreshToken

    const query = new URLSearchParams()
    if (data.page) query.append("page", data.page.toString())
    if (data.limit) query.append("limit", data.limit.toString())
    if (data.status && data.status !== "ALL") query.append("status", data.status)

    return request<SellerOrder[]>("GET", `/core/orders/shop/${data.shopId}?${query.toString()}`, null, accessToken, refreshToken)
  })

export const updateOrderStatusFn = createServerFn({ method: "POST" })
  .inputValidator(Zod(z.object({ orderId: z.string(), status: z.string() })))
  .handler(async ({ data }) => {
    const session = await useAppSession()
    const accessToken = session.data?.accessToken
    const refreshToken = session.data?.refreshToken

    return request<any>("PATCH", `/core/orders/${data.orderId}/status`, { status: data.status }, accessToken, refreshToken)
  })

// FINANCE
export const getShopBalanceFn = createServerFn({ method: "GET" })
  .inputValidator(Zod(z.object({ shopId: z.string() })))
  .handler(async ({ data }) => {
    const session = await useAppSession()
    const accessToken = session.data?.accessToken
    const refreshToken = session.data?.refreshToken

    return request<any>("GET", `/core/shops/${data.shopId}/finance/balance`, null, accessToken, refreshToken)
  })

export const getShopLedgerFn = createServerFn({ method: "GET" })
  .inputValidator(Zod(z.object({ shopId: z.string(), page: z.number().optional(), limit: z.number().optional() })))
  .handler(async ({ data }) => {
    const session = await useAppSession()
    const accessToken = session.data?.accessToken
    const refreshToken = session.data?.refreshToken

    const query = new URLSearchParams()
    if (data.page) query.append("page", data.page.toString())
    if (data.limit) query.append("limit", data.limit.toString())

    return request<any[]>("GET", `/core/shops/${data.shopId}/finance/ledger?${query.toString()}`, null, accessToken, refreshToken)
  })
