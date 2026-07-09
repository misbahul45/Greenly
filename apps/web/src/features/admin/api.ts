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

// USERS
export type AdminUser = {
  id: string
  email: string
  name: string | null
  status: "ACTIVE" | "SUSPENDED" | "BANNED" | "PENDING_VERIFICATION"
  isActive: boolean
  createdAt: string
  roles: string[]
  profile: {
    fullName: string | null
    phoneNumber: string | null
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
    const session = await useAppSession()
    const accessToken = session.data?.accessToken
    const refreshToken = session.data?.refreshToken

    const query = new URLSearchParams()
    if (data.page) query.append("page", data.page.toString())
    if (data.limit) query.append("limit", data.limit.toString())
    if (data.search) query.append("search", data.search)
    if (data.status && data.status !== "ALL") query.append("status", data.status)

    return request<AdminUser[]>("GET", `/core/users?${query.toString()}`, null, accessToken, refreshToken)
  })

export const updateUserStatusFn = createServerFn({ method: "POST" })
  .inputValidator(Zod(z.object({ id: z.string(), status: z.string() })))
  .handler(async ({ data }) => {
    const session = await useAppSession()
    const accessToken = session.data?.accessToken
    const refreshToken = session.data?.refreshToken

    return request<AdminUser>("PATCH", `/core/users/${data.id}`, { status: data.status }, accessToken, refreshToken)
  })

// SHOPS
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
    const session = await useAppSession()
    const accessToken = session.data?.accessToken
    const refreshToken = session.data?.refreshToken

    const query = new URLSearchParams()
    if (data.page) query.append("page", data.page.toString())
    if (data.limit) query.append("limit", data.limit.toString())
    if (data.search) query.append("search", data.search)
    if (data.status && data.status !== "ALL") query.append("status", data.status)

    return request<AdminShop[]>("GET", `/core/shops?${query.toString()}`, null, accessToken, refreshToken)
  })

export const updateShopStatusFn = createServerFn({ method: "POST" })
  .inputValidator(Zod(z.object({ id: z.string(), status: z.string() })))
  .handler(async ({ data }) => {
    const session = await useAppSession()
    const accessToken = session.data?.accessToken
    const refreshToken = session.data?.refreshToken

    return request<AdminShop>("PATCH", `/core/shops/${data.id}`, { status: data.status }, accessToken, refreshToken)
  })

// APPLICATIONS
export type ShopApplication = {
  id: string
  shopId: string
  shop: {
    name: string
    owner: {
      email: string
      profile: {
        fullName: string
      }
    }
  }
  status: "PENDING" | "REVIEW" | "APPROVED" | "REJECTED"
  createdAt: string
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
    const session = await useAppSession()
    const accessToken = session.data?.accessToken
    const refreshToken = session.data?.refreshToken

    const query = new URLSearchParams()
    if (data.page) query.append("page", data.page.toString())
    if (data.limit) query.append("limit", data.limit.toString())
    if (data.status && data.status !== "ALL") query.append("status", data.status)

    return request<ShopApplication[]>("GET", `/core/shops/applications/list?${query.toString()}`, null, accessToken, refreshToken)
  })

export const reviewApplicationFn = createServerFn({ method: "POST" })
  .inputValidator(Zod(z.object({ shopId: z.string(), status: z.string(), notes: z.string().optional() })))
  .handler(async ({ data }) => {
    const session = await useAppSession()
    const accessToken = session.data?.accessToken
    const refreshToken = session.data?.refreshToken

    return request<any>("PATCH", `/core/shops/${data.shopId}/application/review`, { status: data.status, notes: data.notes }, accessToken, refreshToken)
  })

// CATEGORIES
export type AdminCategory = {
  id: string
  name: string
  slug: string
  parentId: string | null
  createdAt: string
}

const GetCategoriesSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
})

export const getCategoriesFn = createServerFn({ method: "GET" })
  .inputValidator(Zod(GetCategoriesSchema))
  .handler(async ({ data }) => {
    const session = await useAppSession()
    const accessToken = session.data?.accessToken
    const refreshToken = session.data?.refreshToken

    const query = new URLSearchParams()
    if (data.page) query.append("page", data.page.toString())
    if (data.limit) query.append("limit", data.limit.toString())

    return request<AdminCategory[]>("GET", `/catalog/categories?${query.toString()}`, null, accessToken, refreshToken)
  })

export const createCategoryFn = createServerFn({ method: "POST" })
  .inputValidator(Zod(z.object({ name: z.string(), parentId: z.string().optional() })))
  .handler(async ({ data }) => {
    const session = await useAppSession()
    const accessToken = session.data?.accessToken
    const refreshToken = session.data?.refreshToken

    return request<AdminCategory>("POST", `/catalog/categories`, data, accessToken, refreshToken)
  })

export const deleteCategoryFn = createServerFn({ method: "POST" })
  .inputValidator(Zod(z.object({ id: z.string() })))
  .handler(async ({ data }) => {
    const session = await useAppSession()
    const accessToken = session.data?.accessToken
    const refreshToken = session.data?.refreshToken

    return request<any>("DELETE", `/catalog/categories/${data.id}`, null, accessToken, refreshToken)
  })

// ORDERS
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
    const session = await useAppSession()
    const accessToken = session.data?.accessToken
    const refreshToken = session.data?.refreshToken

    const query = new URLSearchParams()
    if (data.page) query.append("page", data.page.toString())
    if (data.limit) query.append("limit", data.limit.toString())
    if (data.status && data.status !== "ALL") query.append("status", data.status)

    return request<AdminOrder[]>("GET", `/core/orders?${query.toString()}`, null, accessToken, refreshToken)
  })

// FINANCE
export const getPlatformFinanceFn = createServerFn({ method: "GET" })
  .handler(async () => {
    const session = await useAppSession()
    const accessToken = session.data?.accessToken
    const refreshToken = session.data?.refreshToken

    return request<any>("GET", `/core/admin/finance/overview`, null, accessToken, refreshToken)
  })
