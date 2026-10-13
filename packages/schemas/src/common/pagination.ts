import { z } from "@hono/zod-openapi";

export const paginationMetaSchema = z
  .object({
    page: z.number().openapi({ example: 1 }),
    limit: z.number().openapi({ example: 20 }),
    totalItems: z.number().openapi({ example: 45 }),
    totalPages: z.number().openapi({ example: 3 }),
    hasNextPage: z.boolean().openapi({ example: true }),
    hasPrevPage: z.boolean().openapi({ example: false }),
  })
  .openapi("PaginationMeta");

export type PaginationMeta = z.infer<typeof paginationMetaSchema>;
