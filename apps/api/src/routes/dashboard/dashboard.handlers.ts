import { AppRouteHandler } from "@/lib/types";
import {
  RecentActivityRoute,
  StatsRoute,
  TimelineRoute,
  UpcomingRoute,
} from "./dashboard.routes";
import { createDb } from "@/db";
import { getSession } from "@/lib/get-session";
import {
  applications,
  applicationsStages,
  applicationStatusHistory,
} from "@/db/schema";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  isNotNull,
  isNull,
  lt,
  lte,
} from "drizzle-orm";
import { StatusCodes } from "http-status-codes";
import { getISOWeek } from "@/lib/get-iso-week";

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

export const timeline: AppRouteHandler<TimelineRoute> = async (c) => {
  const db = createDb(c.env);
  const user = getSession(c).user;
  const { weeks, months } = c.req.valid("query");

  const now = new Date();

  // 1. Generate zero-filled weekly buckets (Monday to Sunday)
  const currentMonday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  const dayOfWeek = currentMonday.getUTCDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  currentMonday.setUTCDate(currentMonday.getUTCDate() + diffToMonday);
  currentMonday.setUTCHours(0, 0, 0, 0);

  const weeklyBuckets: Array<{
    period: string;
    label: string;
    start: Date;
    end: Date;
    applied: number;
    statusChanges: number;
  }> = [];

  for (let i = weeks - 1; i >= 0; i--) {
    const startOfWeek = new Date(currentMonday);
    startOfWeek.setUTCDate(startOfWeek.getUTCDate() - i * 7);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setUTCDate(endOfWeek.getUTCDate() + 6);
    endOfWeek.setUTCHours(23, 59, 59, 999);

    const weekNum = String(getISOWeek(startOfWeek)).padStart(2, "0");
    const period = `${startOfWeek.getUTCFullYear()}-W${weekNum}`;

    const startLabel = startOfWeek.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
    const endLabel = endOfWeek.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });

    weeklyBuckets.push({
      period,
      label: `${startLabel} - ${endLabel}`,
      start: startOfWeek,
      end: endOfWeek,
      applied: 0,
      statusChanges: 0,
    });
  }

  // 2. Generate zero-filled monthly buckets
  const monthlyBuckets: Array<{
    period: string;
    label: string;
    start: Date;
    end: Date;
    applied: number;
    statusChanges: number;
  }> = [];

  for (let i = months - 1; i >= 0; i--) {
    const startOfMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1, 0, 0, 0, 0)
    );
    const endOfMonth = new Date(
      Date.UTC(
        startOfMonth.getUTCFullYear(),
        startOfMonth.getUTCMonth() + 1,
        0,
        23,
        59,
        59,
        999
      )
    );

    const monthNum = String(startOfMonth.getUTCMonth() + 1).padStart(2, "0");
    const period = `${startOfMonth.getUTCFullYear()}-${monthNum}`;
    const label = startOfMonth.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });

    monthlyBuckets.push({
      period,
      label,
      start: startOfMonth,
      end: endOfMonth,
      applied: 0,
      statusChanges: 0,
    });
  }

  // 3. Find the earliest start date between weekly and monthly ranges
  const earliestDate =
    weeklyBuckets[0].start < monthlyBuckets[0].start
      ? weeklyBuckets[0].start
      : monthlyBuckets[0].start;

  // 4. Run queries concurrently
  const [rawApplications, rawStatusHistory] = await Promise.all([
    // A. Applications applied in this window
    db
      .select({
        appliedDate: applications.appliedDate,
      })
      .from(applications)
      .where(
        and(
          eq(applications.userId, user.id),
          isNull(applications.deletedAt),
          isNotNull(applications.appliedDate),
          gte(applications.appliedDate, earliestDate)
        )
      ),

    // B. Status changes in this window
    db
      .select({
        changedAt: applicationStatusHistory.changedAt,
      })
      .from(applicationStatusHistory)
      .innerJoin(
        applications,
        eq(applicationStatusHistory.applicationId, applications.id)
      )
      .where(
        and(
          eq(applications.userId, user.id),
          isNull(applications.deletedAt),
          gte(applicationStatusHistory.changedAt, earliestDate)
        )
      ),
  ]);

  // 5. Aggregate applications count into weekly & monthly buckets
  for (const app of rawApplications) {
    if (!app.appliedDate) continue;
    const time = app.appliedDate.getTime();

    for (const week of weeklyBuckets) {
      if (time >= week.start.getTime() && time <= week.end.getTime()) {
        week.applied++;
        break;
      }
    }

    for (const month of monthlyBuckets) {
      if (time >= month.start.getTime() && time <= month.end.getTime()) {
        month.applied++;
        break;
      }
    }
  }

  // 6. Aggregate status changes into weekly & monthly buckets
  for (const history of rawStatusHistory) {
    const time = history.changedAt.getTime();

    for (const week of weeklyBuckets) {
      if (time >= week.start.getTime() && time <= week.end.getTime()) {
        week.statusChanges++;
        break;
      }
    }

    for (const month of monthlyBuckets) {
      if (time >= month.start.getTime() && time <= month.end.getTime()) {
        month.statusChanges++;
        break;
      }
    }
  }

  // 7. Strip out internal start/end Date objects before returning
  const weekly = weeklyBuckets.map(
    ({ period, label, applied, statusChanges }) => ({
      period,
      label,
      applied,
      statusChanges,
    })
  );

  const monthly = monthlyBuckets.map(
    ({ period, label, applied, statusChanges }) => ({
      period,
      label,
      applied,
      statusChanges,
    })
  );

  return c.json(
    {
      timeline: {
        weekly,
        monthly,
      },
    },
    StatusCodes.OK
  );
};

export const recentActivity: AppRouteHandler<RecentActivityRoute> = async (
  c
) => {
  const db = createDb(c.env);
  const user = getSession(c).user;
  const { limit, page } = c.req.valid("query");

  const whereClause = and(
    eq(applications.userId, user.id),
    isNull(applications.deletedAt)
  );

  const offset = (page - 1) * limit;

  const [recentActivity, [{ totalItems }]] = await Promise.all([
    // 1. Fetch paginated recent activity feed
    db
      .select({
        id: applicationStatusHistory.id,
        applicationId: applications.id,
        companyName: applications.companyName,
        roleTitle: applications.roleTitle,
        fromStatus: applicationStatusHistory.fromStatus,
        toStatus: applicationStatusHistory.toStatus,
        changedAt: applicationStatusHistory.changedAt,
      })
      .from(applicationStatusHistory)
      .innerJoin(
        applications,
        eq(applicationStatusHistory.applicationId, applications.id)
      )
      .where(whereClause)
      .orderBy(desc(applicationStatusHistory.changedAt))
      .limit(limit)
      .offset(offset),

    // 2. Count total activity items for accurate pagination
    db
      .select({
        totalItems: count(),
      })
      .from(applicationStatusHistory)
      .innerJoin(
        applications,
        eq(applicationStatusHistory.applicationId, applications.id)
      )
      .where(whereClause),
  ]);

  // 3. Calculate total pages
  const totalPages = Math.ceil(totalItems / limit) || 1;

  return c.json(
    {
      data: recentActivity,
      pagination: {
        page: page,
        limit: limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    },
    StatusCodes.OK
  );
};
