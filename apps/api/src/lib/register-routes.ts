import { AppOpenAPI } from "./types"
import applictions from "../routes/applications/applications.index"
import index from "../routes/index.routes"
import createRouter from "./create-router"

export const registerRoutes = (app: AppOpenAPI) => {
  return app.route("/", index).route("/applications", applictions)
}

// stand alone router type used for api client
export const router = registerRoutes(createRouter().basePath("/"))
export type Router = typeof router
