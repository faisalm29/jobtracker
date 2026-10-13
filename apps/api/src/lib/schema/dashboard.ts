import { z } from "@hono/zod-openapi";
import {
  APPLICATION_STATUSES,
  JOB_TYPES,
  SOURCE_CATEGORIES,
  STAGE_TYPES,
  WORKPLACE_TYPES,
} from "@jobtracker/constants";
import { paginationMetaSchema } from "./pagination";

export const overviewSchema = z
  .object({
    totalApplications: z.number().openapi({ example: 45 }),
    activePipeline: z.number().openapi({ example: 8 }),
    interviewsScheduled: z.number().openapi({ example: 3 }),
    offersReceived: z.number().openapi({ example: 1 }),
    rejections: z.number().openapi({ example: 12 }),
    ghosted: z.number().openapi({ example: 5 }),
    responseRate: z
      .number()
      .openapi({ example: 25.5, description: "Percentage (0-100)" }),
    offerRate: z
      .number()
      .openapi({ example: 4.2, description: "Percentage (0-100)" }),
  })
  .openapi("DashboardOverview");

export const breakdownsSchema = z
  .object({
    byStatus: z.array(
      z.object({
        status: z.enum(APPLICATION_STATUSES),
        count: z.number(),
      })
    ),
    bySourceCategory: z.array(
      z.object({
        sourceCategory: z.enum(SOURCE_CATEGORIES).nullable(),
        count: z.number(),
      })
    ),
    byJobType: z.array(
      z.object({
        jobType: z.enum(JOB_TYPES).nullable(),
        count: z.number(),
      })
    ),
    byWorkplaceType: z.array(
      z.object({
        workplaceType: z.enum(WORKPLACE_TYPES).nullable(),
        count: z.number(),
      })
    ),
  })
  .openapi("DashboardBreakdowns");

export const dashboardStatsSchema = z
  .object({
    overview: overviewSchema,
    breakdowns: breakdownsSchema,
  })
  .openapi("DashboardStats");

export const dashboardUpcomingSchema = z
  .object({
    interviews: z.array(
      z.object({
        id: z.uuid(), // stage id
        applicationId: z.uuid(),
        companyName: z.string(),
        roleTitle: z.string(),
        stageName: z.string(),
        stageType: z.enum(STAGE_TYPES),
        scheduledAt: z.coerce.date<string | Date | undefined>(),
        notes: z.string().nullable(),
      })
    ),
    deadlines: z.array(
      z.object({
        id: z.uuid(), // application id
        companyName: z.string(),
        roleTitle: z.string(),
        status: z.enum(APPLICATION_STATUSES),
        deadline: z.coerce.date<string | Date | undefined>(),
      })
    ),
  })
  .openapi("DashboardUpcoming");

export const timelinePointSchema = z
  .object({
    period: z.string().openapi({
      description:
        "Period identifier (e.g. '2026-W38' for weekly, '2026-09' for monthly)",
      example: "2026-W38",
    }),
    label: z.string().openapi({
      description: "Formatted human-friendly label for charts",
      example: "Sep 14 - Sep 20",
    }),
    applied: z.number().openapi({
      description: "Number of applications submitted in this period",
      example: 8,
    }),
    statusChanges: z.number().openapi({
      description: "Number of status transitions that occurred in this period",
      example: 3,
    }),
  })
  .openapi("DashboardTimelinePoint");

export const dashboardTimelineSchema = z
  .object({
    timeline: z.object({
      weekly: z.array(timelinePointSchema),
      monthly: z.array(timelinePointSchema),
    }),
  })
  .openapi("DashboardTimeline");

export const recentActivityItemSchema = z
  .object({
    id: z.uuid().openapi({
      description: "Activity log ID",
      example: "123e4567-e89b-12d3-a456-426614174000",
    }),
    applicationId: z.uuid().openapi({
      description: "Target application ID",
      example: "123e4567-e89b-12d3-a456-426614174001",
    }),
    companyName: z.string().openapi({ example: "Google" }),
    roleTitle: z.string().openapi({ example: "Frontend Engineer" }),
    fromStatus: z.enum(APPLICATION_STATUSES).nullable().openapi({
      description: "Previous status (null if newly created)",
      example: "applied",
    }),
    toStatus: z.enum(APPLICATION_STATUSES).openapi({
      description: "New status",
      example: "in_progress",
    }),
    changedAt: z.coerce.date<string | Date | undefined>().openapi({
      description: "Timestamp when the status changed",
    }),
  })
  .openapi("DashboardRecentActivityItem");

export const dashboardRecentActivitySchema = z
  .object({
    data: z.array(recentActivityItemSchema),
    pagination: paginationMetaSchema,
  })
  .openapi("DashboardRecentActivity");

export type DashboardStats = z.infer<typeof dashboardStatsSchema>;
export type DashboardUpcoming = z.infer<typeof dashboardUpcomingSchema>;
export type DashboardTimeline = z.infer<typeof dashboardTimelineSchema>;
export type DashboardRecentActivity = z.infer<
  typeof dashboardRecentActivitySchema
>;
