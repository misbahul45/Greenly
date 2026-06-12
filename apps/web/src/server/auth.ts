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

      const res = {
         data: {
            status: "success",
            statusCode: 200,
            data: {
                tokens: {
                    accessToken: "fakeAccessToken",
                    refreshToken: "fakeRefreshToken"
                },
                user: {
                    id: 1,
                    email: "john.doe@example.com",
                    name: "John Doe",
                    roles: ["user", "admin"]
                }
            },
            message: "Login successful",
            timestamp: new Date().toISOString()
         }
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const tokens = res.data.data?.tokens;
    if (!tokens?.accessToken || !tokens?.refreshToken) {
        throw new Error("Login failed: tokens not returned by API");
     }
    const { accessToken, refreshToken } = tokens;

    const session = await useAppSession();
    await session.update({ accessToken, refreshToken });

    // return res.data;
    return res.data;
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