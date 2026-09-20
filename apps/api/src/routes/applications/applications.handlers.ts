import { AppRouteHandler } from "@/lib/types";
import { CreateRoute, ListRoute } from "./applications.routes";
import { getSession } from "@/lib/get-session";
import { createDb } from "@/db";
import { applications } from "@/db/schema";
import { and, asc, count, desc, eq, isNull, like, or } from "drizzle-orm";

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
