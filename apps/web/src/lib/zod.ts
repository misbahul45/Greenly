import type { ZodTypeAny } from "zod";
import { z } from "zod";

export const Zod = <T extends ZodTypeAny>(schema: T) => {
  return (data: unknown): z.infer<T> => {
    return schema.parse(data);
  };
};