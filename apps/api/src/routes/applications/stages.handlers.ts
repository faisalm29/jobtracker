import { AppRouteHandler } from "@/lib/types";
import { CreateStageRoute, ListStagesRoute } from "./stages.routes";
import { createDb } from "@/db";
import { getSession } from "@/lib/get-session";
import { and, asc, desc, eq, isNull } from "drizzle-orm";
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

export const createStage: AppRouteHandler<CreateStageRoute> = async (c) => {
  const db = createDb(c.env);
  const user = getSession(c).user;
  const { id } = c.req.valid("param");
  const body = c.req.valid("json");

  // 1. Verify parent application exists and belongs to the authenticated user
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

  //   2. Detemine orderIndex if not explicitly provided
  let orderIndex = body.orderIndex;
  if (orderIndex === undefined) {
    const [lastStage] = await db
      .select({
        orderIndex: applicationsStages.orderIndex,
      })
      .from(applicationsStages)
      .where(eq(applicationsStages.applicationId, id))
      .orderBy(desc(applicationsStages.orderIndex))
      .limit(1);

    orderIndex = lastStage ? lastStage.orderIndex + 1 : 0;
  }

  //   3. Insert new stage
  const [newStage] = await db
    .insert(applicationsStages)
    .values({
      ...body,
      id: crypto.randomUUID(),
      applicationId: id,
      orderIndex,
    })
    .returning();

  return c.json(newStage, StatusCodes.CREATED);
};
