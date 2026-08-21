import { OpenAPIHono } from "@hono/zod-openapi"
import type { AppEnv } from "./types"

const createRouter = () => {
  return new OpenAPIHono<AppEnv>({
    strict: false,
  })
}

export default createRouter
