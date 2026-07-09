import axios from "axios"
import { createServerFn } from "@tanstack/react-start"
import { useAppSession } from "#/hooks/useSession"

type ApiResult<T> = {
  data: T
  metaData?: {
    total?: number
  }
  meta?: {
    total?: number
  }
}

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

function countFrom(payload: ApiResult<unknown>) {
  if (typeof payload.metaData?.total === "number") return payload.metaData.total
  if (typeof payload.meta?.total === "number") return payload.meta.total
  return Array.isArray(payload.data) ? payload.data.length : 0
}

function sumOrders(payload: ApiResult<any>) {
  const items = Array.isArray(payload.data) ? payload.data : []
  return items.reduce((total, item) => total + Number(item.totalAmount ?? 0), 0)
}

function successCount(results: PromiseSettledResult<ApiResult<unknown>>[], index: number) {
  const result = results[index]
  return result.status === "fulfilled" ? countFrom(result.value) : 0
}

export const getAdminDashboardFn = createServerFn({ method: "GET" }).handler(async () => {
  const session = await useAppSession()
  const accessToken = session.data?.accessToken
  const refreshToken = session.data?.refreshToken

  const results = await Promise.allSettled([
    request("/core/users?page=1&limit=1", accessToken, refreshToken),
    request("/core/shops?page=1&limit=1", accessToken, refreshToken),
    request("/core/orders?page=1&limit=10", accessToken, refreshToken),
    request("/catalog/products?page=1&limit=1", accessToken, refreshToken),
    request("/catalog/categories?page=1&limit=1", accessToken, refreshToken),
    request("/ml/health", accessToken, refreshToken),
  ])

  const orders = results[2]
  const revenue = orders.status === "fulfilled" ? sumOrders(orders.value) : 0
  const ml = results[5]

  return {
    totalUsers: successCount(results, 0),
    totalShops: successCount(results, 1),
    totalOrders: successCount(results, 2),
    totalProducts: successCount(results, 3),
    totalCategories: successCount(results, 4),
    totalRevenue: revenue,
    mlStatus: ml.status === "fulfilled" ? "online" : "offline",
  }
})

export const getSellerDashboardFn = createServerFn({ method: "GET" }).handler(async () => {
  const session = await useAppSession()
  const accessToken = session.data?.accessToken
  const refreshToken = session.data?.refreshToken
  const shopPayload = await request<any>("/core/shops/me", accessToken, refreshToken)
  const shop = shopPayload.data
  const shopId = shop?.id ?? shop?.shop?.id

  if (!shopId) {
    return {
      shopName: shop?.name ?? "Toko",
      totalProducts: 0,
      totalOrders: 0,
      totalRevenue: 0,
      balance: 0,
    }
  }

  const results = await Promise.allSettled([
    request(`/catalog/products?shop_id=${shopId}&page=1&limit=1`, accessToken, refreshToken),
    request(`/core/shops/${shopId}/orders?page=1&limit=10`, accessToken, refreshToken),
    request(`/core/shops/${shopId}/finance/balance`, accessToken, refreshToken),
  ])

  const orders = results[1]
  const balancePayload = results[2]

  return {
    shopName: shop?.name ?? shop?.shop?.name ?? "Toko",
    totalProducts: successCount(results, 0),
    totalOrders: successCount(results, 1),
    totalRevenue: orders.status === "fulfilled" ? sumOrders(orders.value) : 0,
    balance: balancePayload.status === "fulfilled" ? Number((balancePayload.value.data as any)?.balance ?? 0) : 0,
  }
})
