import { createRoute, z } from "@hono/zod-openapi"

export const list = createRoute({
  path: "/",
  method: "get",
  tags: ["Applications"],
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
      description: "Get a welcome message.",
    },
  },
})

export type ListRoute = typeof list
