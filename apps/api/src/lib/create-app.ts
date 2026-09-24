import { createRouter } from "./create-router";
import { createAuth } from "./auth";
import { attachSession } from "@/middlewares/attach-session";
import { requireAuth } from "@/middlewares/require-auth";
import { cors } from "hono/cors";

const createApp = () => {
  const app = createRouter();

  app.use(
    "*",
    cors({
      origin: [
        "http://localhost:5173",
        "https://faisalownedjobtracker.pages.dev",
      ],
      allowHeaders: ["Content-Type", "Authorization"],
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      credentials: true,
    })
  );

  app.use("*", attachSession);
  app.use("/applications/*", requireAuth);
  app.use("/dashboard/*", requireAuth);

  app.on(["POST", "GET"], "/api/auth/*", (c) =>
    createAuth(c.env).handler(c.req.raw)
  );

  return app;
};

export default createApp;
