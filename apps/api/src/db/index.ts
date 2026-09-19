import { drizzle } from "drizzle-orm/d1"
import * as schema from "./schema"
import { AppEnv } from "@/lib/types"

// for better auth schema generation
export const db = (env: AppEnv["Bindings"]) => {
  return drizzle(env.DB, {
    schema,
  })
}

// for use within hono handlers where we can access cloudflare bindings
export const createDb = (env: AppEnv["Bindings"]) => {
  return drizzle(env.DB, {
    schema,
  })
}
