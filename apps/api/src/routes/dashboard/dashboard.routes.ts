import { createErrorSchema } from "@/lib/create-error-schema";
import { createMessageObjectSchema } from "@/lib/create-message-object-schema";
import { jsonContent } from "@/lib/json-content";
import {
  dashboardStatsQuerySchema,
  dashboardStatsResponseSchema,
} from "@/validators/dashboard-validator";
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
      dashboardStatsResponseSchema,
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

export type StatsRoute = typeof stats;
