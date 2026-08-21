import { createSelectSchema } from "drizzle-zod"
import { applications } from "./schema"

export const selectApplicationsSchema = createSelectSchema(applications)
