import { z } from "@hono/zod-openapi";

export const optionalDate = z.preprocess(
  (val: string | Date | undefined | null) => (val === "" ? null : val),
  z.coerce.date().nullish()
);
