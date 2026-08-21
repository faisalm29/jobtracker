// import { testClient } from "hono/testing"
// import createApp from "../lib/create-app"
// import router from "./applications.index"

// const client = testClient(createApp().route("/", router))

// const res = await client.applications.$get()
// const { message } = await res.json()

// import { hc } from "hono/client"
// import router from "./applications.index"
// import { Router } from "../lib/register-routes"

// const client = hc<Router>("http://localhost:8787/")
// const res = await client.applications.$get()
// const { message } = await res.json()
