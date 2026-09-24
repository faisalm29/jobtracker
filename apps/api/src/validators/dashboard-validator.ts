import { z } from "@hono/zod-openapi";
import {
  APPLICATION_STATUSES,
  JOB_TYPES,
  SOURCE_CATEGORIES,
  STAGE_TYPES,
  WORKPLACE_TYPES,
} from "@jobtracker/constants";
import { paginationMetaSchema } from "./query-validator";

export const overviewSchema = z.object({
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
});

export const breakdownsSchema = z.object({
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
});

export const dashboardStatsResponseSchema = z.object({
  overview: overviewSchema,
  breakdowns: breakdownsSchema,
});

export const dashboardStatsQuerySchema = z.object({
  appliedFrom: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.coerce.date().optional().openapi({
      description:
        "Filter applications applied on or after this date (ISO 8601 or YYYY-MM-DD)",
      example: "2026-01-01",
    })
  ),
  appliedTo: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.coerce.date().optional().openapi({
      description:
        "Filter applications applied on or before this date (ISO 8601 or YYYY-MM-DD)",
      example: "2026-03-31",
    })
  ),
});

export const dashboardUpcomingQuerySchema = z.object({
  days: z.coerce
    .number()
    .int()
    .positive()
    .max(90)
    .optional()
    .default(14)
    .openapi({
      description: "Number of days to look ahead",
      example: 14,
    }),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(50)
    .optional()
    .default(5)
    .openapi({
      description: "Maximum number of items to return per section",
      example: 5,
    }),
});

export const dashboardUpcomingResponseSchema = z.object({
  interviews: z.array(
    z.object({
      id: z.uuid(), // using stage id
      applicationId: z.uuid(),
      companyName: z.string(),
      roleTitle: z.string(),
      stageName: z.string(),
      stageType: z.enum(STAGE_TYPES),
      scheduledAt: z.date(),
      notes: z.string().nullable(),
    })
  ),
  deadlines: z.array(
    z.object({
      id: z.uuid(), // using application id
      companyName: z.string(),
      roleTitle: z.string(),
      status: z.enum(APPLICATION_STATUSES),
      deadline: z.date(),
    })
  ),
});

export const dashboardTimelineQuerySchema = z.object({
  weeks: z.coerce
    .number()
    .int()
    .positive()
    .max(52)
    .optional()
    .default(12)
    .openapi({
      description: "Number of past weeks to include in the weekly timeline",
      example: 12,
    }),
  months: z.coerce
    .number()
    .int()
    .positive()
    .max(24)
    .optional()
    .default(6)
    .openapi({
      description: "Number of past months to include in the monthly timeline",
      example: 6,
    }),
});

export const timelinePointSchema = z.object({
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
});

export const dashboardTimelineResponseSchema = z.object({
  timeline: z.object({
    weekly: z.array(timelinePointSchema),
    monthly: z.array(timelinePointSchema),
  }),
});

export const dashboardRecentActivityQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1).openapi({
    description: "Page number (1-based)",
    example: 1,
  }),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(50)
    .optional()
    .default(10)
    .openapi({
      description: "Number of activity items per page (max 50)",
      example: 10,
    }),
});

export const recentActivityItemSchema = z.object({
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
  changedAt: z.date().openapi({
    description: "Timestamp when the status changed",
  }),
});

export const dashboardRecentActivityResponseSchema = z.object({
  data: z.array(recentActivityItemSchema),
  pagination: paginationMetaSchema,
});

export type DashboardStatsResponse = z.infer<
  typeof dashboardStatsResponseSchema
>;

export type DashboardStatsQuery = z.infer<typeof dashboardStatsQuerySchema>;

export type DashboardUpcomingResponse = z.infer<
  typeof dashboardUpcomingResponseSchema
>;

export type DashboardUpcomingQuery = z.infer<
  typeof dashboardUpcomingQuerySchema
>;

export type DashboardTimelineQuery = z.infer<
  typeof dashboardTimelineQuerySchema
>;

export type DashboardTimelineResponse = z.infer<
  typeof dashboardTimelineResponseSchema
>;

export type DashboardRecentActivityQuery = z.infer<
  typeof dashboardRecentActivityQuerySchema
>;

export type DashboardRecentActivityResponse = z.infer<
  typeof dashboardRecentActivityResponseSchema
>;
