import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import { Zod } from "#/lib/zod"
import { withSession } from "#/server/_request"
import { createCatalogApi } from "#/server/api"
import type { ApiMeta } from "#/types/api.response"

/*
import axios from "axios"
import { useAppSession } from "#/hooks/useSession"
-- old apiBaseUrl pattern removed, now using withSession helper --
*/

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

const GetUsersSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  search: z.string().optional(),
  status: z.string().optional(),
})

export const getUsersFn = createServerFn({ method: "GET" })
  .inputValidator(Zod(GetUsersSchema))
  .handler(async ({ data }) => {
    return withSession(async (api) => {
      const params = cleanParams({
        page: data.page,
        limit: data.limit,
        search: data.search,
        status: data.status !== "ALL" ? data.status : undefined,
      })
      const res = await api.get("/users", { params })
      return res.data as ApiResult<AdminUser[]>
    })
  })

export const updateUserStatusFn = createServerFn({ method: "POST" })
  .inputValidator(Zod(z.object({ id: z.string(), status: z.string() })))
  .handler(async ({ data }) => {
    return withSession(async (api) => {
      const res = await api.patch(`/users/${data.id}`, { status: data.status })
      return res.data
    })
  })

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

const GetShopsSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  search: z.string().optional(),
  status: z.string().optional(),
})

export const getShopsFn = createServerFn({ method: "GET" })
  .inputValidator(Zod(GetShopsSchema))
  .handler(async ({ data }) => {
    return withSession(async (api) => {
      const params = cleanParams({
        page: data.page,
        limit: data.limit,
        search: data.search,
        status: data.status !== "ALL" ? data.status : undefined,
      })
      const res = await api.get("/shops", { params })
      return res.data as ApiResult<AdminShop[]>
    })
  })

export const updateShopStatusFn = createServerFn({ method: "POST" })
  .inputValidator(Zod(z.object({ id: z.string(), status: z.string() })))
  .handler(async ({ data }) => {
    return withSession(async (api) => {
      const res = await api.patch(`/shops/${data.id}`, { status: data.status })
      return res.data
    })
  })

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

const GetApplicationsSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  status: z.string().optional(),
})

export const getApplicationsFn = createServerFn({ method: "GET" })
  .inputValidator(Zod(GetApplicationsSchema))
  .handler(async ({ data }) => {
    return withSession(async (api) => {
      const shopsRes = await api.get("/shops", { params: { page: 1, limit: 100 } })
      const shopItems: AdminShop[] = Array.isArray(shopsRes.data?.data)
        ? shopsRes.data.data
        : Array.isArray(shopsRes.data)
        ? shopsRes.data
        : []

      const apps = await Promise.all(
        shopItems.map(async (shop) => {
          try {
            const appRes = await api.get(`/shops/${shop.id}/application`)
            const appData: ShopApplication = appRes.data?.data ?? appRes.data
            return {
              ...appData,
              shop: appData.shop ?? {
                name: shop.name,
                owner: {
                  email: shop.owner?.email ?? "-",
                  profile: { fullName: shop.owner?.profile?.fullName ?? "-" },
                },
              },
            } as ShopApplication
          } catch {
            return null
          }
        })
      )

      const filtered = apps
        .filter((app): app is ShopApplication => Boolean(app))
        .filter((app) => !data.status || data.status === "ALL" || app.status === data.status)

      return { data: filtered, meta: { total: filtered.length } }
    })
  })

export const reviewApplicationFn = createServerFn({ method: "POST" })
  .inputValidator(Zod(z.object({ shopId: z.string(), status: z.string(), notes: z.string().optional() })))
  .handler(async ({ data }) => {
    return withSession(async (api) => {
      const res = await api.patch(`/shops/${data.shopId}/application/review`, {
        status: data.status,
        notes: data.notes,
      })
      return res.data
    })
  })

export type AdminCategory = {
  id: string
  name: string
  slug: string
  parentId: string | null
  createdAt: string
  updatedAt: string
}

const GetCategoriesSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  search: z.string().optional(),
})

export const getCategoriesFn = createServerFn({ method: "GET" })
  .inputValidator(Zod(GetCategoriesSchema))
  .handler(async ({ data }) => {
    return catalogRequest<{ data: AdminCategory[]; meta?: ApiMeta }>(async (api) => {
      const params = cleanParams({ page: data.page, limit: data.limit, search: data.search })
      const res = await api.get("/categories", { params })
      return { data: res.data?.data ?? [], meta: res.data?.meta }
    })
  })

export const createCategoryFn = createServerFn({ method: "POST" })
  .inputValidator(Zod(z.object({ name: z.string(), parentId: z.string().optional() })))
  .handler(async ({ data }) => {
    return catalogRequest<AdminCategory>(async (api) => {
      const res = await api.post("/categories", { name: data.name, parentId: data.parentId })
      return res.data?.data ?? res.data
    })
  })

export const updateCategoryFn = createServerFn({ method: "POST" })
  .inputValidator(Zod(z.object({ id: z.string(), name: z.string().optional(), parentId: z.string().nullable().optional() })))
  .handler(async ({ data }) => {
    return catalogRequest<AdminCategory>(async (api) => {
      const { id, ...payload } = data
      const res = await api.put(`/categories/${id}`, cleanParams(payload as Record<string, any>))
      return res.data?.data ?? res.data
    })
  })

export const deleteCategoryFn = createServerFn({ method: "POST" })
  .inputValidator(Zod(z.object({ id: z.string() })))
  .handler(async ({ data }) => {
    return catalogRequest<any>(async (api) => {
      const res = await api.delete(`/categories/${data.id}`)
      return res.data
    })
  })

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

const GetAllOrdersSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  status: z.string().optional(),
})

export const getAllOrdersFn = createServerFn({ method: "GET" })
  .inputValidator(Zod(GetAllOrdersSchema))
  .handler(async ({ data }) => {
    return withSession(async (api) => {
      const params = cleanParams({
        page: data.page,
        limit: data.limit,
        status: data.status !== "ALL" ? data.status : undefined,
      })
      const res = await api.get("/orders", { params })
      return res.data as ApiResult<AdminOrder[]>
    })
  })

export const getPlatformFinanceFn = createServerFn({ method: "GET" })
  .handler(async () => {
    return withSession(async (api) => {
      const res = await api.get("/admin/finance/overview")
      return res.data
    })
  })
