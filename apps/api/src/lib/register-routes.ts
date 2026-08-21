import { AppOpenAPI } from "./types"
import applictions from "../routes/applications.index"
import createRouter from "./create-router"

export const registerRoutes = (app: AppOpenAPI) => {
  return app.route("/", applictions)
}

// stand alone router type used for api client
export const router = registerRoutes(createRouter().basePath("/"))
export type Router = typeof router
