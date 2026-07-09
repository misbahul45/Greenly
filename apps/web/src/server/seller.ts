import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import { Zod } from "#/lib/zod"
import { withSession } from "#/server/_request"
import { createCatalogApi } from "#/server/api"
import type { ApiMeta } from "#/types/api.response"
import type { SellerProduct, SellerOrder, SellerShop } from "#/types/server"

type ApiResult<T> = {
  data: T
  meta?: ApiMeta
  metaData?: ApiMeta
  message?: string
}

async function catalogRequest<T>(
  fn: (api: ReturnType<typeof createCatalogApi>) => Promise<T>
): Promise<T> {
  return withSession((coreApi) => {
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

export const getMyShopFn = createServerFn({ method: "GET" })
  .handler(async () => {
    return withSession(async (api) => {
      const res = await api.get("/shops/me")
      const raw = res.data
      const shops: SellerShop[] = Array.isArray(raw?.data)
        ? raw.data
        : Array.isArray(raw)
        ? raw
        : []
      return shops
    })
  })

const GetSellerProductsSchema = z.object({
  shopId: z.string(),
  page: z.number().optional(),
  limit: z.number().optional(),
  search: z.string().optional(),
})

export const getSellerProductsFn = createServerFn({ method: "GET" })
  .inputValidator(Zod(GetSellerProductsSchema))
  .handler(async ({ data }) => {
    return catalogRequest<ApiResult<SellerProduct[]>>(async (api) => {
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
  .handler(async ({ data }) => {
    return catalogRequest<any>(async (api) => {
      const res = await api.post("/products", data)
      return res.data
    })
  })

export const updateProductFn = createServerFn({ method: "POST" })
  .inputValidator(Zod(z.object({ id: z.string(), data: ProductPayloadSchema })))
  .handler(async ({ data }) => {
    return catalogRequest<any>(async (api) => {
      const res = await api.put(`/products/${data.id}`, data.data)
      return res.data
    })
  })

export const deleteProductFn = createServerFn({ method: "POST" })
  .inputValidator(Zod(z.object({ id: z.string() })))
  .handler(async ({ data }) => {
    return catalogRequest<any>(async (api) => {
      const res = await api.delete(`/products/${data.id}`)
      return res.data
    })
  })

export const toggleProductFn = createServerFn({ method: "POST" })
  .inputValidator(Zod(z.object({ id: z.string() })))
  .handler(async ({ data }) => {
    return catalogRequest<any>(async (api) => {
      const res = await api.patch(`/products/${data.id}/toggle`)
      return res.data
    })
  })

const GetShopOrdersSchema = z.object({
  shopId: z.string(),
  page: z.number().optional(),
  limit: z.number().optional(),
  status: z.string().optional(),
})

export const getShopOrdersFn = createServerFn({ method: "GET" })
  .inputValidator(Zod(GetShopOrdersSchema))
  .handler(async ({ data }) => {
    return withSession(async (api) => {
      const params = cleanParams({
        page: data.page,
        limit: data.limit,
        status: data.status !== "ALL" ? data.status : undefined,
      })
      const res = await api.get(`/orders/shop/${data.shopId}`, { params })
      return {
        data: res.data?.data ?? [],
        meta: res.data?.metaData ?? res.data?.meta,
      } as ApiResult<SellerOrder[]>
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
  .handler(async ({ data }) => {
    return withSession(async (api) => {
      const res = await api.patch(`/shops/${data.shopId}/orders/${data.orderId}/status`, {
        status: data.status,
      })
      return res.data
    })
  })

export const getShopBalanceFn = createServerFn({ method: "GET" })
  .inputValidator(Zod(z.object({ shopId: z.string() })))
  .handler(async ({ data }) => {
    return withSession(async (api) => {
      const res = await api.get(`/shops/${data.shopId}/finance/balance`)
      const raw = res.data
      return {
        balance: Number(raw?.data?.balance ?? raw?.balance ?? 0),
      }
    })
  })

export const getShopLedgerFn = createServerFn({ method: "GET" })
  .inputValidator(
    Zod(z.object({ shopId: z.string(), page: z.number().optional(), limit: z.number().optional() }))
  )
  .handler(async ({ data }) => {
    return withSession(async (api) => {
      const params = cleanParams({ page: data.page, limit: data.limit })
      const res = await api.get(`/shops/${data.shopId}/finance/ledger`, { params })
      return {
        data: res.data?.data ?? [],
        meta: res.data?.metaData ?? res.data?.meta,
      } as ApiResult<any[]>
    })
  })
