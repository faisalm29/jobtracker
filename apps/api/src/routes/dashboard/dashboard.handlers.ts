import { AppRouteHandler } from "@/lib/types";
import { StatsRoute, UpcomingRoute } from "./dashboard.routes";
import { createDb } from "@/db";
import { getSession } from "@/lib/get-session";
import { applications, applicationsStages } from "@/db/schema";
import {
  and,
  asc,
  count,
  eq,
  gte,
  isNotNull,
  isNull,
  lt,
  lte,
  sql,
} from "drizzle-orm";
import { StatusCodes } from "http-status-codes";

export const stats: AppRouteHandler<StatsRoute> = async (c) => {
  const db = createDb(c.env);
  const user = getSession(c).user;
  const { appliedFrom, appliedTo } = c.req.valid("query");

  // 1. Build base filter conditions
  const conditions = [
    eq(applications.userId, user.id),
    isNull(applications.deletedAt),
  ];

  if (appliedFrom) {
    conditions.push(gte(applications.appliedDate, appliedFrom));
  }

  if (appliedTo) {
    const endOfDay = new Date(appliedTo);
    endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);
    conditions.push(lt(applications.appliedDate, endOfDay));
  }

  const baseWhere = and(...conditions);

  // 2. Run breakdown and stage queries in parallel
  const [
    byStatus,
    bySourceCategory,
    byJobType,
    byWorkplaceType,
    [scheduledStages],
  ] = await Promise.all([
    db
      .select({
        status: applications.status,
        count: count(),
      })
      .from(applications)
      .where(baseWhere)
      .groupBy(applications.status),
    db
      .select({
        sourceCategory: applications.sourceCategory,
        count: count(),
      })
      .from(applications)
      .where(baseWhere)
      .groupBy(applications.sourceCategory),
    db
      .select({
        jobType: applications.jobType,
        count: count(),
      })
      .from(applications)
      .where(baseWhere)
      .groupBy(applications.jobType),
    db
      .select({
        workplaceType: applications.workplaceType,
        count: count(),
      })
      .from(applications)
      .where(baseWhere)
      .groupBy(applications.workplaceType),
    db
      .select({ count: count() })
      .from(applicationsStages)
      .innerJoin(
        applications,
        eq(applicationsStages.applicationId, applications.id)
      )
      .where(and(baseWhere, eq(applicationsStages.status, "scheduled"))),
  ]);

  // 3. Compute overview metrics in-memory from byStatus
  const statusMap = Object.fromEntries(
    byStatus.map((s) => [s.status, s.count])
  ) as Record<string, number>;
  const saved = statusMap["saved"] ?? 0;
  const applied = statusMap["applied"] ?? 0;
  const inProgress = statusMap["in_progress"] ?? 0;
  const offered = statusMap["offered"] ?? 0;
  const accepted = statusMap["accepted"] ?? 0;
  const rejections = statusMap["rejected"] ?? 0;
  const ghosted = statusMap["ghosted"] ?? 0;
  const totalApplications = byStatus.reduce((acc, curr) => acc + curr.count, 0);
  const activePipeline = applied + inProgress;
  const offersReceived = offered + accepted;
  const interviewsScheduled = scheduledStages?.count ?? 0;
  // Rate calculations (based on submitted applications, excluding 'saved')
  const totalSubmitted = totalApplications - saved;
  const responded = inProgress + offersReceived;
  const responseRate =
    totalSubmitted > 0
      ? Math.round((responded / totalSubmitted) * 1000) / 10
      : 0;
  const offerRate =
    totalSubmitted > 0
      ? Math.round((offersReceived / totalSubmitted) * 1000) / 10
      : 0;

  return c.json(
    {
      overview: {
        totalApplications,
        activePipeline,
        interviewsScheduled,
        offersReceived,
        rejections,
        ghosted,
        responseRate,
        offerRate,
      },
      breakdowns: {
        byStatus,
        bySourceCategory,
        byJobType,
        byWorkplaceType,
      },
    },
    StatusCodes.OK
  );
};

export const upcoming: AppRouteHandler<UpcomingRoute> = async (c) => {
  const db = createDb(c.env);
  const user = getSession(c).user;
  const { days, limit } = c.req.valid("query");

  const now = new Date();
  const futureLimit = new Date();
  futureLimit.setUTCDate(futureLimit.getUTCDate() + days);
  futureLimit.setUTCHours(23, 59, 59, 999);

  const [rawInterviews, rawDeadlines] = await Promise.all([
    // 1. Upcoming Interviews
    db
      .select({
        id: applicationsStages.id,
        applicationId: applicationsStages.applicationId,
        companyName: applications.companyName,
        roleTitle: applications.roleTitle,
        stageName: applicationsStages.name,
        stageType: applicationsStages.type,
        scheduledAt: applicationsStages.scheduledAt,
        notes: applicationsStages.notes,
      })
      .from(applicationsStages)
      .innerJoin(
        applications,
        eq(applicationsStages.applicationId, applications.id)
      )
      .where(
        and(
          eq(applications.userId, user.id),
          isNull(applications.deletedAt),
          eq(applicationsStages.status, "scheduled"),
          isNotNull(applicationsStages.scheduledAt),
          gte(applicationsStages.scheduledAt, now),
          lte(applicationsStages.scheduledAt, futureLimit)
        )
      )
      .orderBy(asc(applicationsStages.scheduledAt))
      .limit(limit),

    // 2. Approaching Deadlines
    db
      .select({
        id: applications.id,
        companyName: applications.companyName,
        roleTitle: applications.roleTitle,
        status: applications.status,
        deadline: applications.deadline,
      })
      .from(applications)
      .where(
        and(
          eq(applications.userId, user.id),
          isNull(applications.deletedAt),
          eq(applications.status, "saved"),
          isNotNull(applications.deadline),
          gte(applications.deadline, now),
          lte(applications.deadline, futureLimit)
        )
      )
      .orderBy(asc(applications.deadline))
      .limit(limit),
  ]);

  const interviews = rawInterviews.map((item) => ({
    ...item,
    scheduledAt: item.scheduledAt as Date,
  }));

  const deadlines = rawDeadlines.map((item) => ({
    ...item,
    deadline: item.deadline as Date,
  }));

  return c.json(
    {
      interviews,
      deadlines,
    },
    StatusCodes.OK
  );
};
