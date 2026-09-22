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
  gte,
  inArray,
  isNotNull,
  isNull,
  like,
  lt,
  or,
  sql,
  SQL,
} from "drizzle-orm";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { SQLiteColumn } from "drizzle-orm/sqlite-core";

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
  if (query.status && query.status.length > 0) {
    if (query.status.length === 1) {
      conditions.push(eq(applications.status, query.status[0]));
    } else {
      conditions.push(inArray(applications.status, query.status));
    }
  }
  if (query.sourceCategory) {
    conditions.push(eq(applications.sourceCategory, query.sourceCategory));
  }
  if (query.sourceName) {
    conditions.push(likeWithEscape(applications.sourceName, query.sourceName));
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
        likeWithEscape(applications.companyName, query.search),
        likeWithEscape(applications.roleTitle, query.search)
      )!
    );
  }
  // Date range filter
  if (query.appliedFrom) {
    conditions.push(gte(applications.appliedDate, query.appliedFrom));
  }

  if (query.appliedTo) {
    // If a user passes "2026-03-31", JS parses it as 00:00:00 UTC.
    // Set to start of the next day at 00:00:00 so all applications on the day before included:
    const endOfDay = new Date(query.appliedTo);
    endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);
    conditions.push(lt(applications.appliedDate, endOfDay));
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
    StatusCodes.OK
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

  return c.json(result, StatusCodes.OK);
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

  return c.json(newApplication, StatusCodes.CREATED);
};

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const db = createDb(c.env);
  const user = getSession(c).user;
  const { id } = c.req.valid("param");
  const updates = c.req.valid("json");

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
    const [[updatedApplication]] = await db.batch([
      db
        .update(applications)
        .set({
          ...updates,
          statusChangedAt: new Date(),
        })
        .where(
          and(
            eq(applications.id, id),
            eq(applications.userId, user.id),
            isNull(applications.deletedAt)
          )
        )
        .returning(),
      db.insert(applicationStatusHistory).values({
        id: crypto.randomUUID(),
        applicationId: id,
        fromStatus: existing.status,
        toStatus: updates.status!,
        changedAt: new Date(),
      }),
    ]);
    return c.json(updatedApplication, StatusCodes.OK);
  }

  const [updatedApplication] = await db
    .update(applications)
    .set(updates)
    .where(
      and(
        eq(applications.id, id),
        eq(applications.userId, user.id),
        isNull(applications.deletedAt)
      )
    )
    .returning();

  return c.json(updatedApplication, StatusCodes.OK);
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

  return c.json(restoredApplication, StatusCodes.OK);
};

function likeWithEscape(column: SQLiteColumn, searchTerm: string): SQL {
  const escaped = searchTerm.replace(/[%_\\]/g, "\\$&");
  return sql`${column} LIKE ${`%${escaped}%`} ESCAPE '\\'`;
}
