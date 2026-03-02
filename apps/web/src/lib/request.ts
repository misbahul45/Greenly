import axios from "axios";
import { useAppSession } from "#/hooks/useSession";
import type { ApiResponse } from "#/types/api.response";
import { createApi } from "#/server/api";

export const serverRequest = async <T>(
  ctx: any,
  fn: (api: ReturnType<typeof createApi>) => Promise<T>
) => {
  const session = await useAppSession();

  let accessToken = session?.data?.accessToken;
  const refreshToken = session?.data?.refreshToken;

  const api = createApi(accessToken);

  try {
    return await fn(api);
  } catch (error: any) {
    if (error.response?.status === 401) {
      if (!refreshToken) throw new Error("Unauthenticated");

      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL || process.env.API_URL}/auth/refresh`,
          {},
          {
            headers: { Authorization: `Bearer ${refreshToken}` },
            withCredentials: true,
          }
        );

        accessToken = res.data.data.accessToken;
        const apiRetry = createApi(accessToken);
        return await fn(apiRetry);
      } catch {
        throw new Error("Unauthenticated");
      }
    }

    throw error;
  }
};


export const apiRequest = async <T>(
  promise: Promise<{ data: ApiResponse<T> }>
): Promise<T> => {
  const res = await promise;
  if (res.data.status !== "success") throw new Error(res.data.message);
  return res.data.data;
};