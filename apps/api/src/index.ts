import { Hono } from "hono"

const app = new Hono()

app.get("/", (c) => {
  return c.text("Welcome to Jobtracker API!")
})

export default app
