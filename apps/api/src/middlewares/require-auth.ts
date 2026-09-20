import { AppEnv } from "@/lib/types";
import { createMiddleware } from "hono/factory";
import { StatusCodes } from "http-status-codes";

export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  const session = c.get("session");

  if (!session) {
    return c.json(
      {
        message: "Unauthorized",
      },
      StatusCodes.UNAUTHORIZED
    );
  }

  await next();
});
