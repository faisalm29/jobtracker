import { OpenAPIHono, RouteConfig, RouteHandler } from "@hono/zod-openapi"

export interface AppEnv {
  Bindings: CloudflareBindings
}

export type AppOpenAPI = OpenAPIHono<AppEnv, {}, "/">

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, AppEnv>
