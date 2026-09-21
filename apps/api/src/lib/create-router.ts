import { OpenAPIHono } from "@hono/zod-openapi";
import { AppEnv } from "./types";
import defaultHook from "./default-hook";

export const createRouter = () => {
  return new OpenAPIHono<AppEnv>({
    strict: false,
    defaultHook,
  });
};
