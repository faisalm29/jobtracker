import { createRouter } from "@/lib/create-router";
import * as routes from "./dashboard.routes";
import * as handlers from "./dashboard.handlers";

const router = createRouter()
  .openapi(routes.stats, handlers.stats)
  .openapi(routes.upcoming, handlers.upcoming);

export default router;
