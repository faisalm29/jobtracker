import { z } from "@hono/zod-openapi";
import {
  APPLICATION_STATUSES,
  JOB_TYPES,
  SOURCE_CATEGORIES,
  STAGE_TYPES,
  WORKPLACE_TYPES,
} from "@jobtracker/constants";

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
