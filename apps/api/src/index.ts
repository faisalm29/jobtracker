import { registerRoutes } from "./lib/register-routes"
import createApp from "./lib/create-app"
import configureOpenAPI from "./lib/configure-open-api"

const app = registerRoutes(createApp())
configureOpenAPI(app)

export default app
