import { hc } from "hono/client"
import { type Router } from "@jobtracker/api/lib/register-routes"

export const client = hc<Router>("http://localhost:8787")
