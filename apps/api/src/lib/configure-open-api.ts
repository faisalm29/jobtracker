import { Scalar } from "@scalar/hono-api-reference"
import type { AppOpenAPI } from "./types"
import packageJSON from "../../package.json"

const configureOpenAPI = (app: AppOpenAPI) => {
  app.doc("/doc", {
    openapi: "3.0.0",
    info: {
      version: packageJSON.version,
      title: "Jobtracker API",
    },
  })

  app.get(
    "/reference",
    Scalar({
      url: "/doc",
      defaultHttpClient: {
        targetKey: "node",
        clientKey: "fetch",
      },
    })
  )
}

export default configureOpenAPI
