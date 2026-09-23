import { z } from "@hono/zod-openapi";
import {
  APPLICATION_STATUSES,
  JOB_TYPES,
  SOURCE_CATEGORIES,
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

export type DashboardStatsResponse = z.infer<
  typeof dashboardStatsResponseSchema
>;

export type DashboardStatsQuery = z.infer<typeof dashboardStatsQuerySchema>;
