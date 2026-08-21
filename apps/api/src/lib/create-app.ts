import createRouter from "./create-router"
import { AppOpenAPI } from "./types"

const createApp = () => {
  const app = createRouter() as AppOpenAPI
  return app
}

export default createApp

export const createTestApp = <R extends AppOpenAPI>(router: R) => {
  return createApp().route("/", router)
}
