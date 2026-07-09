import { useAppSession } from "#/hooks/useSession.server";
import type { ApiResponse } from "#/types/api.response";
import { createApi } from "#/server/api";

export const withSession = async <T>(
  fn: (api: ReturnType<typeof createApi>) => Promise<T>
): Promise<T> => {
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
          ApiResponse<{ accessToken: string; refreshToken: string }>
        >("/auth/refresh-token");

        if (refreshRes.data.status !== "success" || !refreshRes.data.data) {
          throw new Error("Token refresh failed");
        }

        const { accessToken: newAt, refreshToken: newRt } = refreshRes.data.data;

        await session.update({ accessToken: newAt, refreshToken: newRt });
        api = createApi(newAt);

        return await fn(api);
      } catch {
        await session.clear();
        throw new Error("Session expired");
      }
    }

    throw error;
  }
};
