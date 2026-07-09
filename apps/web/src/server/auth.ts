import { Zod } from "#/lib/zod";
import { LoginSchema } from "#/schema/auth";
import { createServerFn } from "@tanstack/react-start";
import { createApi } from "./api";
import { apiRequest } from "#/lib/request";
import { withSession } from "#/server/_request";
import type { UserResponse } from "#/types/user.me";
import { useAppSession } from "#/hooks/useSession.server";
import type { ApiResponse } from "#/types/api.response";
import type { LoginResponse } from "#/types/login.response";

export const loginFn = createServerFn({ method: "POST" })
  .inputValidator(Zod(LoginSchema))
  .handler(async ({ data }) => {
    const api = createApi();

    const res = await api.post<ApiResponse<LoginResponse>>("/auth/login", data);
    const loginResponse = await apiRequest<LoginResponse>(Promise.resolve(res));

    const { accessToken, refreshToken } = loginResponse.tokens;
    if (!accessToken || !refreshToken) {
      throw new Error("Login failed: tokens not returned by API");
    }

    const session = await useAppSession();
    await session.update({ accessToken, refreshToken });

    return loginResponse;
  });

export const getCurrentUserFn =
  createServerFn({ method: "GET" })
    .handler(async () => {
      return withSession((api) =>
        apiRequest(api.get("/me"))
      );
    });

export const logoutFn =
  createServerFn({ method: "POST" })
    .handler(async () => {
      const session = await useAppSession();

      try {
        await withSession(async (api) => {
          await api.post("/auth/logout");
          return {};
        });
      } catch {
        // Session tetap dibersihkan walau request logout server gagal/expired.
      } finally {
        await session.clear();
      }

      return {};
    });
