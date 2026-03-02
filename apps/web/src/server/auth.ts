import { Zod } from "#/lib/zod";
import { LoginSchema } from "#/schema/auth";
import { createServerFn } from "@tanstack/react-start";
import { createApi } from "./api";
import { apiRequeest, serverRequest } from "#/lib/request";
import type { UserResponse } from "#/types/user.me";
import { useAppSession } from "#/hooks/useSession";

export const loginFn = createServerFn({ method: 'POST' })
  .inputValidator(Zod(LoginSchema))
  .handler(async ({ data }) => {
    const api = createApi()

    const res = await api.post('/auth/login', data)
    const { accessToken, refreshToken } = res.data

    const session = await useAppSession()

    await session.update({
        accessToken,
        refreshToken
    })

    return res.data
  })

export const getCurrentUserFn =
  createServerFn({ method: "GET" })
    .handler(async (ctx) => {
      return serverRequest<UserResponse>(ctx, (api) =>
        apiRequeest(
          api.get("/me")
        )
      );
    });