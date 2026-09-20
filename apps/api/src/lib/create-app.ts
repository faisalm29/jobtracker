import { createRouter } from "./create-router";
import { createAuth } from "./auth";
import { attachSession } from "@/middlewares/attach-session";
import { requireAuth } from "@/middlewares/require-auth";

const createApp = () => {
  const app = createRouter();

  app.use("*", attachSession);
  app.use("/applications/*", requireAuth);

  app.on(["POST", "GET"], "/api/auth/*", (c) =>
    createAuth(c.env).handler(c.req.raw)
  );

  return app;
};

export default createApp;
