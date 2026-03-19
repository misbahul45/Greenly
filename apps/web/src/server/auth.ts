import { Zod } from "#/lib/zod";
import { LoginSchema } from "#/schema/auth";
import { createServerFn } from "@tanstack/react-start";
import { createApi } from "./api";
import { apiRequest, serverRequest } from "#/lib/request";
import type { UserResponse } from "#/types/user.me";
import { useAppSession } from "#/hooks/useSession";
import type { ApiResponse } from "#/types/api.response";
import type { LoginResponse } from "#/types/login.response";

export const loginFn = createServerFn({ method: "POST" })
  .inputValidator(Zod(LoginSchema))
  .handler(async ({ data }) => {
    const api = createApi();

    // const res = await api.post<ApiResponse<LoginResponse>>("/auth/login", data);

    // const tokens = res.data.data?.tokens;
    // if (!tokens?.accessToken || !tokens?.refreshToken) {
    //   throw new Error("Login failed: tokens not returned by API");
    // }

    const dataLogin: LoginResponse = {
      tokens: {
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ik1pc2JhaHVsIE11dHRhcWluIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
        refreshToken: "dGhpcyBpcyBhIHJhbmRvbSByZWZyZXNoIHRva2VuIGV4YW1wbGUgMTIzNDU2Nzg5MA=="
      },
      user: {
        id: 1024,
        email: "misbahulmuttaqin395@gmail.com",
        name: "Misbahul Muttaqin",
        roles: ["user", "developer"]
      }
    };

    const { accessToken, refreshToken } = dataLogin.tokens;

    const session = await useAppSession();
    await session.update({ accessToken, refreshToken });

    // return res.data;
    return dataLogin
  });

export const getCurrentUserFn =
  createServerFn({ method: "GET" })
    .handler(async (ctx) => {
      return serverRequest<UserResponse>(ctx, (api) =>
        apiRequest(
          api.get("/me")
        )
      );
    });