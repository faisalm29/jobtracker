import { OpenAPIHono, RouteConfig, RouteHandler, z } from "@hono/zod-openapi";
import { createAuth } from "./auth";

export interface AppEnv {
  Variables: {
    session: ReturnType<typeof createAuth>["$Infer"]["Session"] | null;
  };
  Bindings: {
    DB: D1Database;
  };
}

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, AppEnv>;
export type AppOpenAPI = OpenAPIHono<AppEnv, {}, "/">;

export type ZodSchema = z.ZodUnion | z.ZodObject | z.ZodArray<z.ZodType>;

export type ZodIssue = z.core.$ZodIssue;
