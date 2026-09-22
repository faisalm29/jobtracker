import { AppRouteHandler } from "@/lib/types";
import {
  CreateStageRoute,
  ListStagesRoute,
  PatchStageRoute,
  RemoveStageRoute,
  ReorderStageRoute,
} from "./stages.routes";
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

export const patchStage: AppRouteHandler<PatchStageRoute> = async (c) => {
  const db = createDb(c.env);
  const user = getSession(c).user;
  const { id, stageId } = c.req.valid("param");
  const updates = c.req.valid("json");

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

  // 2. Perform update
  const [updatedStage] = await db
    .update(applicationsStages)
    .set({
      ...updates,
    })
    .where(
      and(
        eq(applicationsStages.applicationId, id),
        eq(applicationsStages.id, stageId)
      )
    )
    .returning();

  // 3. Verify stage was found and updated
  if (!updatedStage) {
    return c.json(
      {
        message: ReasonPhrases.NOT_FOUND,
      },
      StatusCodes.NOT_FOUND
    );
  }

  return c.json(updatedStage, StatusCodes.OK);
};

export const removeStage: AppRouteHandler<RemoveStageRoute> = async (c) => {
  const db = createDb(c.env);
  const user = getSession(c).user;
  const { id, stageId } = c.req.valid("param");

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

  // Perform delete
  const [deletedStage] = await db
    .delete(applicationsStages)
    .where(
      and(
        eq(applicationsStages.applicationId, id),
        eq(applicationsStages.id, stageId)
      )
    )
    .returning();

  if (!deletedStage) {
    return c.json(
      {
        message: ReasonPhrases.NOT_FOUND,
      },
      StatusCodes.NOT_FOUND
    );
  }

  return c.body(null, StatusCodes.NO_CONTENT);
};

export const reorderStages: AppRouteHandler<ReorderStageRoute> = async (c) => {
  const db = createDb(c.env);
  const user = getSession(c).user;
  const { id } = c.req.valid("param");
  const { stageIds } = c.req.valid("json");

  // 1. Verify parent application exists and belongs to the user
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

  // 2. Verify all provided stageIds belong to this application
  const existingStages = await db
    .select({ id: applicationsStages.id })
    .from(applicationsStages)
    .where(eq(applicationsStages.applicationId, id));

  const existingStageIdSet = new Set(existingStages.map((s) => s.id));
  const allBelongToApp = stageIds.every((stageId) =>
    existingStageIdSet.has(stageId)
  );
  if (!allBelongToApp || stageIds.length !== existingStages.length) {
    return c.json(
      { message: "One or more stage IDs do not belong to this application" },
      StatusCodes.BAD_REQUEST
    );
  }

  // 3. Atomically update orderIndex using Cloudflare D1 batch
  const batchUpdates = stageIds.map((stageId, index) =>
    db
      .update(applicationsStages)
      .set({ orderIndex: index })
      .where(
        and(
          eq(applicationsStages.applicationId, id),
          eq(applicationsStages.id, stageId)
        )
      )
  );

  await db.batch(batchUpdates as [any, ...any[]]);
  // 4. Return the updated stages list ordered by the new orderIndex
  const updatedStages = await db
    .select()
    .from(applicationsStages)
    .where(eq(applicationsStages.applicationId, id))
    .orderBy(
      asc(applicationsStages.orderIndex),
      asc(applicationsStages.createdAt)
    );

  return c.json(updatedStages, StatusCodes.OK);
};
