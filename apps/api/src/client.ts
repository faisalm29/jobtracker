import { hc } from "hono/client";
import type { Router } from "./routes";

export const hcWithType = (...args: Parameters<typeof hc>) =>
  hc<Router>(...args);

export type Client = ReturnType<typeof hcWithType>;
