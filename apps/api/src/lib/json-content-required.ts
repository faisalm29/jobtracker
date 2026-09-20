import { z } from "@hono/zod-openapi";
import { jsonContent } from "./json-content.js";

export const jsonContentRequired = <T extends z.ZodType>(
  schema: T,
  description: string
) => {
  return {
    ...jsonContent(schema, description),
    required: true,
  };
};
