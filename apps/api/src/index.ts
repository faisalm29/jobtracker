import { registerRoutes } from "./lib/register-routes"
import createApp from "./lib/create-app"

const app = registerRoutes(createApp())

// app.get('/', (c) => {
//   return c.text('Hello Hono!')
// })

export default app
