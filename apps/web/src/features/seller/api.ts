import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

import { apiRequest, serverRequest } from "#/lib/request"
import { Zod } from "#/lib/zod"
import type { ApiMeta } from "#/types/api.response"

type ApiResult<T> = {
  data: T
  meta?: ApiMeta
  message?: string
}

type ShopBalance = {
  balance: number | string
}

type ShopLedger = {
  id: string
  description?: string | null
  reference?: string | null
  type: "CREDIT" | "DEBIT"
  amount: number | string
  createdAt: string
}

const ShopIdSchema = z.object({
  shopId: z.string(),
})

const ShopLedgerSchema = z.object({
  shopId: z.string(),
  page: z.number().optional(),
  limit: z.number().optional(),
})

function cleanParams<T extends Record<string, unknown>>(params: T) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== "")
  )
}

export const getMyShopFn = createServerFn({ method: "GET" })
  .handler(async (ctx) => {
    return serverRequest<ApiResult<any>>(ctx, async (api) => {
      const res = await api.get("/shops/me")
      return {
        data: res.data.data,
        meta: res.data.metaData ?? res.data.metadata,
        message: res.data.message,
      }
    })
  })

export const getShopBalanceFn = createServerFn({ method: "GET" })
  .inputValidator(Zod(ShopIdSchema))
  .handler(async ({ data, context }) => {
    const balance = await serverRequest<ShopBalance>(context, (api) =>
      apiRequest(api.get(`/shops/${data.shopId}/finance/balance`))
    )

    return { data: balance }
  })

export const getShopLedgerFn = createServerFn({ method: "GET" })
  .inputValidator(Zod(ShopLedgerSchema))
  .handler(async ({ data, context }) => {
    return serverRequest<ApiResult<ShopLedger[]>>(context, async (api) => {
      const { shopId, ...params } = data
      const res = await api.get(`/shops/${shopId}/finance/ledger`, {
        params: cleanParams(params),
      })

      return {
        data: res.data.data ?? [],
        meta: res.data.metaData ?? res.data.metadata,
        message: res.data.message,
      }
    })
  })
