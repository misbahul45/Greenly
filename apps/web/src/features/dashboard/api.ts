import { createServerFn } from "@tanstack/react-start"
import { serverRequest } from "#/lib/request"
import { createCatalogApi } from "#/server/api"

/*
import axios from "axios"
import { useAppSession } from "#/hooks/useSession"

const API_TIMEOUT_MS = 15000

function apiBaseUrl() {
  const coreUrl = process.env.API_URL
  if (coreUrl) {
    return coreUrl.replace(/\/core\/?$/, "")
  }
  return process.env.API_BASE_URL ?? process.env.VITE_API_BASE_URL ?? "http://localhost/api"
}

async function request<T>(path: string, accessToken?: string, refreshToken?: string) {
  const response = await axios.get<ApiResult<T>>(`${apiBaseUrl()}${path}`, {
    timeout: API_TIMEOUT_MS,
    headers: {
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      ...(refreshToken && { "x-refresh-token": refreshToken }),
    },
  })
  return response.data
}
*/

type ApiResult<T> = {
  data: T
  metaData?: { total?: number }
  meta?: { total?: number }
}

function countFrom(payload: ApiResult<unknown>) {
  if (typeof payload.metaData?.total === "number") return payload.metaData.total
  if (typeof payload.meta?.total === "number") return payload.meta.total
  return Array.isArray(payload.data) ? payload.data.length : 0
}

function sumOrders(payload: ApiResult<any>) {
  const items = Array.isArray(payload.data) ? payload.data : []
  return items.reduce((total: number, item: any) => total + Number(item.totalAmount ?? 0), 0)
}

function firstShopFromPayload(payload: ApiResult<any>) {
  const data = payload.data
  if (Array.isArray(data)) return data[0] ?? null
  if (Array.isArray(data?.data)) return data.data[0] ?? null
  return data?.shop ?? data ?? null
}

export const getAdminDashboardFn = createServerFn({ method: "GET" })
  .handler(async ({ context }) => {
    return serverRequest<{
      totalUsers: number
      totalShops: number
      totalOrders: number
      totalProducts: number
      totalCategories: number
      totalRevenue: number
      mlStatus: string
    }>(context, async (api) => {
      const headers = api.defaults.headers as Record<string, any>
      const authorization = headers.Authorization ?? headers.common?.Authorization
      const token = authorization?.toString().replace("Bearer ", "")
      const catalogApi = createCatalogApi(token)

      const results = await Promise.allSettled([
        api.get("/users", { params: { page: 1, limit: 1 } }),
        api.get("/shops", { params: { page: 1, limit: 1 } }),
        api.get("/orders", { params: { page: 1, limit: 10 } }),
        catalogApi.get("/products", { params: { page: 1, limit: 1 } }),
        catalogApi.get("/categories", { params: { page: 1, limit: 1 } }),
      ])

      const pick = (i: number) =>
        results[i].status === "fulfilled"
          ? countFrom(results[i].value.data as ApiResult<unknown>)
          : 0

      const ordersPayload =
        results[2].status === "fulfilled"
          ? (results[2].value.data as ApiResult<any>)
          : null

      return {
        totalUsers: pick(0),
        totalShops: pick(1),
        totalOrders: pick(2),
        totalProducts: pick(3),
        totalCategories: pick(4),
        totalRevenue: ordersPayload ? sumOrders(ordersPayload) : 0,
        mlStatus: "unknown",
      }
    })
  })

export const getSellerDashboardFn = createServerFn({ method: "GET" })
  .handler(async ({ context }) => {
    return serverRequest<{
      shopName: string
      totalProducts: number
      totalOrders: number
      totalRevenue: number
      balance: number
    }>(context, async (api) => {
      const headers = api.defaults.headers as Record<string, any>
      const authorization = headers.Authorization ?? headers.common?.Authorization
      const token = authorization?.toString().replace("Bearer ", "")
      const catalogApi = createCatalogApi(token)

      const shopPayload = await api.get("/shops/me")
      const shop = firstShopFromPayload(shopPayload.data as ApiResult<any>)
      const shopId: string | undefined = shop?.id

      if (!shopId) {
        return {
          shopName: shop?.name ?? "-",
          totalProducts: 0,
          totalOrders: 0,
          totalRevenue: 0,
          balance: 0,
        }
      }

      const results = await Promise.allSettled([
        catalogApi.get("/products", { params: { shop_id: shopId, page: 1, limit: 1 } }),
        api.get(`/shops/${shopId}/orders`, { params: { page: 1, limit: 10 } }),
        api.get(`/shops/${shopId}/finance/balance`),
      ])

      const ordersPayload =
        results[1].status === "fulfilled"
          ? (results[1].value.data as ApiResult<any>)
          : null

      const balanceData =
        results[2].status === "fulfilled"
          ? (results[2].value.data as any)
          : null

      return {
        shopName: shop?.name ?? "-",
        totalProducts:
          results[0].status === "fulfilled"
            ? countFrom(results[0].value.data as ApiResult<unknown>)
            : 0,
        totalOrders: ordersPayload ? countFrom(ordersPayload) : 0,
        totalRevenue: ordersPayload ? sumOrders(ordersPayload) : 0,
        balance: Number(balanceData?.data?.balance ?? balanceData?.balance ?? 0),
      }
    })
  })
