import { OpenAPIHono } from "@hono/zod-openapi";
import { AppEnv } from "./types";

export const createRouter = () => {
  return new OpenAPIHono<AppEnv>({
    strict: false,
  });
};
