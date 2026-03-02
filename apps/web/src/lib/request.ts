import { useAppSession } from "#/hooks/useSession";
import { createApi } from "#/server/api";
import type { ApiResponse } from "#/types/api.response";

export const apiRequeest= async <T>(
  promise: Promise<{ data: ApiResponse<T> }>
): Promise<T> => {
  const res = await promise;

  if (res.data.status !== "success") {
    throw new Error(res.data.message);
  }

  return res.data.data;
};


export const serverRequest = async <T>(
  ctx: any,
  fn: (api: ReturnType<typeof createApi>) => Promise<T>
) => {
  const cookie = useAppSession() as any ?? undefined;
  const api = createApi(cookie);

  try {
    return await fn(api);
  } catch (error: any) {
    if (error.response?.status === 401) {

      try {
        await api.post("/auth/refresh");
      } catch {
        throw new Error("Unauthenticated");
      }
      return await fn(api);
    }

    throw error;
  }
};