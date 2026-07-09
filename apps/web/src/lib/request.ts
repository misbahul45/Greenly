import type { ApiResponse } from "#/types/api.response";
import { createApi } from "#/server/api";

export const serverRequest = async <T>(
  _ctx: any,
  fn: (api: ReturnType<typeof createApi>) => Promise<T>
): Promise<T> => {
  return fn(createApi());
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
