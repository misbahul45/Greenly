import { createServerFn } from "@tanstack/react-start"
import { withSession } from "#/server/_request"
import { createCatalogApi } from "#/server/api"

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

export const getAdminDashboardFn = createServerFn({ method: "GET" })
  .handler(async () => {
    return withSession(async (api) => {
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
  .handler(async () => {
    return withSession(async (api) => {
      const headers = api.defaults.headers as Record<string, any>
      const authorization = headers.Authorization ?? headers.common?.Authorization
      const token = authorization?.toString().replace("Bearer ", "")
      const catalogApi = createCatalogApi(token)

      const shopRes = await api.get("/shops/me")
      const raw = shopRes.data
      const shops: any[] = Array.isArray(raw?.data)
        ? raw.data
        : Array.isArray(raw)
        ? raw
        : []

      const shop = shops[0] ?? null
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
