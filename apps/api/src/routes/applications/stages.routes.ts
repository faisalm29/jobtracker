import { selectApplicationStageSchema } from "@/db/schema";
import { createErrorSchema } from "@/lib/create-error-schema";
import { createMessageObjectSchema } from "@/lib/create-message-object-schema";
import { jsonContent } from "@/lib/json-content";
import { applicationParamsSchema } from "@/validators/application-validator";
import { createRoute, z } from "@hono/zod-openapi";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

const tags = ["Application Stages"];

export const listStages = createRoute({
  tags,
  path: "/{id}/stages",
  method: "get",
  security: [{ Bearer: [] }],
  request: {
    params: applicationParamsSchema,
  },
  responses: {
    [StatusCodes.OK as 200]: jsonContent(
      z.array(selectApplicationStageSchema),
      "List of stages for the application"
    ),
    [StatusCodes.NOT_FOUND as 404]: jsonContent(
      createMessageObjectSchema(ReasonPhrases.NOT_FOUND),
      "Application not found"
    ),
    [StatusCodes.UNPROCESSABLE_ENTITY as 422]: jsonContent(
      createErrorSchema(applicationParamsSchema),
      "The validation error(s)"
    ),
    [StatusCodes.UNAUTHORIZED as 401]: jsonContent(
      createMessageObjectSchema(ReasonPhrases.UNAUTHORIZED),
      "The unauthorized error"
    ),
  },
});

export type ListStagesRoute = typeof listStages;
