import { AppRouteHandler } from "@/lib/types";
import { CreateRoute } from "../applications/applications.routes";
import { getSession } from "@/lib/get-session";
import { createDb } from "@/db";
import { applications } from "@/db/schema";

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const db = createDb(c.env);
  const user = getSession(c).user;
  const reqBody = c.req.valid("json");

  const [newApplication] = await db
    .insert(applications)
    .values({
      ...reqBody,
      id: crypto.randomUUID(),
      userId: user.id,
    })
    .returning();

  return c.json(newApplication, 201);
};
