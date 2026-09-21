import { createRouter } from "@/lib/create-router";
import * as routes from "./applications.routes";
import * as stageRoutes from "./stages.routes";
import * as handlers from "./applications.handlers";
import * as stageHandlers from "./stages.handlers";

const router = createRouter()
  // Application endpoints
  .openapi(routes.list, handlers.list)
  .openapi(routes.getOne, handlers.getOne)
  .openapi(routes.create, handlers.create)
  .openapi(routes.patch, handlers.patch)
  .openapi(routes.remove, handlers.remove)
  .openapi(routes.restore, handlers.restore)
  // Stage endpoints
  .openapi(stageRoutes.listStages, stageHandlers.listStages);

export default router;
