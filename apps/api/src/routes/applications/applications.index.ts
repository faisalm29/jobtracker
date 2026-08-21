import createRouter from "../../lib/create-router"
import * as handlers from "./applications.handlers"
import * as routes from "./applications.routes"

const router = createRouter().openapi(routes.list, handlers.list)

export default router
