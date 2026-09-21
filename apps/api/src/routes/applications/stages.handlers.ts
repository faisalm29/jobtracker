import { AppRouteHandler } from "@/lib/types";
import { ListStagesRoute } from "./stages.routes";
import { createDb } from "@/db";
import { getSession } from "@/lib/get-session";
import { and, asc, eq, isNull } from "drizzle-orm";
import { applications, applicationsStages } from "@/db/schema";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

export const listStages: AppRouteHandler<ListStagesRoute> = async (c) => {
  const db = createDb(c.env);
  const user = getSession(c).user;
  const { id } = c.req.valid("param");

  // 1. Verify application exists and belongs to the authenticated user
  const application = await db.query.applications.findFirst({
    where: and(
      eq(applications.id, id),
      eq(applications.userId, user.id),
      isNull(applications.deletedAt)
    ),
  });

  if (!application) {
    return c.json(
      {
        message: ReasonPhrases.NOT_FOUND,
      },
      StatusCodes.NOT_FOUND
    );
  }

  // 2. Fetch stages ordered by orderIndex
  const stages = await db
    .select()
    .from(applicationsStages)
    .where(eq(applicationsStages.applicationId, id))
    .orderBy(
      asc(applicationsStages.orderIndex),
      asc(applicationsStages.createdAt)
    );

  return c.json(stages, StatusCodes.OK);
};
