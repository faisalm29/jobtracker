import { createRoute, z } from "@hono/zod-openapi"
import createRouter from "../lib/create-router"

const router = createRouter().openapi(
  createRoute({
    tags: ["Index"],
    method: "get",
    path: "/",
    responses: {
      200: {
        content: {
          "application/json": {
            schema: z.object({
              message: z.string(),
            }),
          },
        },
        description: "Job Applications Tracker API.",
      },
    },
  }),
  (c) => {
    return c.json(
      {
        message: "Job Applications Tracker API",
      },
      200
    )
  }
)

export default router
