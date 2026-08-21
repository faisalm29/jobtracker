import { AppRouteHandler } from "../lib/types"
import { ListRoute } from "./applications.routes"

export const list: AppRouteHandler<ListRoute> = async (c) => {
  return c.json(
    {
      message: "Hello, Hono!",
    },
    200
  )
}
