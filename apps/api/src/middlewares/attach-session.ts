import { createAuth } from "@/lib/auth";
import { AppEnv } from "@/lib/types";
import { createMiddleware } from "hono/factory";

export const attachSession = createMiddleware<AppEnv>(async (c, next) => {
  const session = await createAuth(c.env).api.getSession({
    headers: c.req.raw.headers,
  });

  c.set("session", session);

  await next();
});
