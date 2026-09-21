import { AppRouteHandler } from "@/lib/types";
import {
  CreateRoute,
  GetOneRoute,
  ListRoute,
  PatchRoute,
  RemoveRoute,
  RestoreRoute,
} from "./applications.routes";
import { getSession } from "@/lib/get-session";
import { createDb } from "@/db";
import { applications, applicationStatusHistory } from "@/db/schema";
import {
  and,
  asc,
  count,
  desc,
  eq,
  isNotNull,
  isNull,
  like,
  or,
} from "drizzle-orm";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const db = createDb(c.env);
  const user = getSession(c).user;
  const query = c.req.valid("query");

  // 1. Base condition: always scope to the authenticated user
  const conditions = [eq(applications.userId, user.id)];

  // 2. Soft-delete check
  if (!query.includeDeleted) {
    conditions.push(isNull(applications.deletedAt));
  }

  // 3. Optional filters
  if (query.status) {
    conditions.push(eq(applications.status, query.status));
  }
  if (query.sourceCategory) {
    conditions.push(eq(applications.sourceCategory, query.sourceCategory));
  }
  if (query.sourceName) {
    conditions.push(like(applications.sourceName, `%${query.sourceName}%`));
  }
  if (query.jobType) {
    conditions.push(eq(applications.jobType, query.jobType));
  }
  if (query.workplaceType) {
    conditions.push(eq(applications.workplaceType, query.workplaceType));
  }
  if (query.search) {
    conditions.push(
      or(
        like(applications.companyName, `%${query.search}%`),
        like(applications.roleTitle, `%${query.search}%`)
      )!
    );
  }

  const whereClause = and(...conditions);

  // 4. Count total matching rows
  const [{ totalItems }] = await db
    .select({
      totalItems: count(),
    })
    .from(applications)
    .where(whereClause);

  // 5. Dynamic Sorting
  const sortColumn = applications[query.sortBy];
  const orderDirection = query.sortOrder === "asc" ? asc : desc;

  // 6. Pagination offset
  const offset = (query.page - 1) * query.limit;

  const data = await db
    .select()
    .from(applications)
    .where(whereClause)
    .orderBy(orderDirection(sortColumn))
    .limit(query.limit)
    .offset(offset);

  // 7. Calculate pagination metadata
  const totalPages = Math.ceil(totalItems / query.limit) || 1;

  return c.json(
    {
      data,
      pagination: {
        page: query.page,
        limit: query.limit,
        totalItems,
        totalPages,
        hasNextPage: query.page < totalPages,
        hasPrevPage: query.page > 1,
      },
    },
    200
  );
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const db = createDb(c.env);
  const user = getSession(c).user;
  const { id } = c.req.valid("param");

  const result = await db.query.applications.findFirst({
    where: and(
      eq(applications.userId, user.id),
      eq(applications.id, id),
      isNull(applications.deletedAt)
    ),
    with: {
      stages: {
        orderBy: (stages, { asc }) => [asc(stages.orderIndex)],
      },
      statusHistory: {
        orderBy: (history, { desc }) => [desc(history.changedAt)],
      },
    },
  });

  if (!result) {
    return c.json(
      {
        message: ReasonPhrases.NOT_FOUND,
      },
      StatusCodes.NOT_FOUND
    );
  }

  return c.json(result, 200);
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const db = createDb(c.env);
  const user = getSession(c).user;
  const reqBody = c.req.valid("json");

  const applicationId = crypto.randomUUID();
  const initialStatus = reqBody.status ?? "saved";

  const [[newApplication]] = await db.batch([
    db
      .insert(applications)
      .values({
        ...reqBody,
        id: applicationId,
        userId: user.id,
      })
      .returning(),
    db.insert(applicationStatusHistory).values({
      id: crypto.randomUUID(),
      applicationId,
      fromStatus: null,
      toStatus: initialStatus,
      changedAt: new Date(),
    }),
  ]);

  return c.json(newApplication, 201);
};

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const db = createDb(c.env);
  const user = getSession(c).user;
  const { id } = c.req.valid("param");
  const updates = c.req.valid("json");

  if (Object.keys(updates).length === 0) {
    return c.json(
      {
        success: false,
        error: {
          issues: [
            {
              code: "invalid_updates",
              path: [],
              message: "No updates provided",
            },
          ],
          name: "ZodError",
        },
      },
      StatusCodes.UNPROCESSABLE_ENTITY
    );
  }

  const existing = await db.query.applications.findFirst({
    where: and(
      eq(applications.userId, user.id),
      eq(applications.id, id),
      isNull(applications.deletedAt)
    ),
  });

  if (!existing) {
    return c.json(
      {
        message: ReasonPhrases.NOT_FOUND,
      },
      StatusCodes.NOT_FOUND
    );
  }

  const hasStatusChanged = updates.status && updates.status !== existing.status;

  if (hasStatusChanged) {
    await db.insert(applicationStatusHistory).values({
      id: crypto.randomUUID(),
      applicationId: id,
      fromStatus: existing.status,
      toStatus: updates.status!,
      changedAt: new Date(),
    });
  }

  const [updatedApplication] = await db
    .update(applications)
    .set({
      ...updates,
      ...(hasStatusChanged ? { statusChangedAt: new Date() } : {}),
    })
    .where(and(eq(applications.id, id), eq(applications.userId, user.id)))
    .returning();

  return c.json(updatedApplication, 200);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const db = createDb(c.env);
  const user = getSession(c).user;
  const { id } = c.req.valid("param");

  const [deletedApplication] = await db
    .update(applications)
    .set({
      deletedAt: new Date(),
    })
    .where(
      and(
        eq(applications.userId, user.id),
        eq(applications.id, id),
        isNull(applications.deletedAt)
      )
    )
    .returning();

  if (!deletedApplication) {
    return c.json(
      {
        message: ReasonPhrases.NOT_FOUND,
      },
      StatusCodes.NOT_FOUND
    );
  }

  return c.body(null, StatusCodes.NO_CONTENT);
};

export const restore: AppRouteHandler<RestoreRoute> = async (c) => {
  const db = createDb(c.env);
  const user = getSession(c).user;
  const { id } = c.req.valid("param");

  const [restoredApplication] = await db
    .update(applications)
    .set({
      deletedAt: null,
    })
    .where(
      and(
        eq(applications.userId, user.id),
        eq(applications.id, id),
        isNotNull(applications.deletedAt)
      )
    )
    .returning();

  if (!restoredApplication) {
    return c.json(
      {
        message: ReasonPhrases.NOT_FOUND,
      },
      StatusCodes.NOT_FOUND
    );
  }

  return c.json(restoredApplication, 200);
};
