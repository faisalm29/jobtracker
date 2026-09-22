import { z } from "@hono/zod-openapi";

export const optionalDate = z.preprocess(
  (val) => (val === "" ? null : val),
  z.coerce.date().nullish()
);
