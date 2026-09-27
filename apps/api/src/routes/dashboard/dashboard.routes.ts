import { createErrorSchema } from "@/lib/create-error-schema";
import { createMessageObjectSchema } from "@/lib/create-message-object-schema";
import { jsonContent } from "@/lib/json-content";
import {
  dashboardRecentActivitySchema,
  dashboardStatsSchema,
  dashboardTimelineSchema,
  dashboardUpcomingSchema,
} from "@/lib/schema/dashboard";
import {
  dashboardRecentActivityQuerySchema,
  dashboardStatsQuerySchema,
  dashboardTimelineQuerySchema,
  dashboardUpcomingQuerySchema,
} from "@/lib/schema/query";
import { createRoute } from "@hono/zod-openapi";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

const tags = ["Dashboard"];

export const stats = createRoute({
  tags,
  path: "/stats",
  method: "get",
  security: [{ Bearer: [] }],
  request: {
    query: dashboardStatsQuerySchema,
  },
  responses: {
    [StatusCodes.OK as 200]: jsonContent(
      dashboardStatsSchema,
      "The returned stats"
    ),
    [StatusCodes.UNPROCESSABLE_ENTITY as 422]: jsonContent(
      createErrorSchema(dashboardStatsQuerySchema),
      "The validation error(s)"
    ),
    [StatusCodes.UNAUTHORIZED as 401]: jsonContent(
      createMessageObjectSchema(ReasonPhrases.UNAUTHORIZED),
      "The unauthorized error"
    ),
  },
});

export const upcoming = createRoute({
  tags,
  path: "/upcoming",
  method: "get",
  security: [{ Bearer: [] }],
  request: {
    query: dashboardUpcomingQuerySchema,
  },
  responses: {
    [StatusCodes.OK as 200]: jsonContent(
      dashboardUpcomingSchema,
      "The returned scheduled interviews and approaching deadlines"
    ),
    [StatusCodes.UNPROCESSABLE_ENTITY as 422]: jsonContent(
      createErrorSchema(dashboardUpcomingQuerySchema),
      "The validation error(s)"
    ),
    [StatusCodes.UNAUTHORIZED as 401]: jsonContent(
      createMessageObjectSchema(ReasonPhrases.UNAUTHORIZED),
      "The unauthorized error"
    ),
  },
});

export const timeline = createRoute({
  tags,
  path: "/timeline",
  method: "get",
  security: [{ Bearer: [] }],
  request: {
    query: dashboardTimelineQuerySchema,
  },
  responses: {
    [StatusCodes.OK as 200]: jsonContent(
      dashboardTimelineSchema,
      "The returned timeline (weekly and monthly) and recent activity"
    ),
    [StatusCodes.UNPROCESSABLE_ENTITY as 422]: jsonContent(
      createErrorSchema(dashboardTimelineQuerySchema),
      "The validation error(s)"
    ),
    [StatusCodes.UNAUTHORIZED as 401]: jsonContent(
      createMessageObjectSchema(ReasonPhrases.UNAUTHORIZED),
      "The unauthorized error"
    ),
  },
});

export const recentActivity = createRoute({
  tags,
  path: "/recent-activity",
  method: "get",
  security: [{ Bearer: [] }],
  request: {
    query: dashboardRecentActivityQuerySchema,
  },
  responses: {
    [StatusCodes.OK as 200]: jsonContent(
      dashboardRecentActivitySchema,
      "The returned recent activity"
    ),
    [StatusCodes.UNPROCESSABLE_ENTITY as 422]: jsonContent(
      createErrorSchema(dashboardRecentActivityQuerySchema),
      "The validation error(s)"
    ),
    [StatusCodes.UNAUTHORIZED]: jsonContent(
      createMessageObjectSchema(ReasonPhrases.UNAUTHORIZED),
      "The unauthorized error"
    ),
  },
});

export type StatsRoute = typeof stats;
export type UpcomingRoute = typeof upcoming;
export type TimelineRoute = typeof timeline;
export type RecentActivityRoute = typeof recentActivity;
