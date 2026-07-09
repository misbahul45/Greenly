import { useAppSession } from "#/hooks/useSession";
import type { ApiResponse } from "#/types/api.response";
import { createApi } from "#/server/api";

export const serverRequest = async <T>(
  _: any,
  fn: (api: ReturnType<typeof createApi>) => Promise<T>
) => {
  const session = await useAppSession();

  let accessToken = session?.data?.accessToken;
  const refreshToken = session?.data?.refreshToken;

  let api = createApi(accessToken);

  try {
    return await fn(api);
  } catch (error: any) {
    if (error.response?.status === 401) {
      if (!refreshToken) {
        await session.clear();
        throw new Error("Unauthenticated");
      }

      try {
        const refreshRes = await createApi(refreshToken).post<
          ApiResponse<{
            accessToken: string
            refreshToken: string
          }>
        >("/auth/refresh-token");

        const refreshed = await apiRequest(Promise.resolve(refreshRes));
        const newAccessToken = refreshed.accessToken;
        const newRefreshToken = refreshed.refreshToken;

        await session.update({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        });

        api = createApi(newAccessToken);

        return await fn(api);
      } catch (e) {
        await session.clear();
        throw new Error("Session expired");
      }
    }

    throw error;
  }
};


export const apiRequest = async <T>(
  promise: Promise<{ data: ApiResponse<T> }>
): Promise<T> => {
  const res = await promise;

  if (res.data.status !== "success") {
    throw new Error(res.data.message);
  }

  if (!res.data.data) {
    throw new Error("No data");
  }

  return res.data.data;
};
