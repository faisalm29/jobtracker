import { selectApplicationStageSchema } from "@/db/schema";
import { createErrorSchema } from "@/lib/create-error-schema";
import { createMessageObjectSchema } from "@/lib/create-message-object-schema";
import { jsonContent } from "@/lib/json-content";
import { jsonContentRequired } from "@/lib/json-content-required";
import {
  applicationParamsSchema,
  createStageBodySchema,
} from "@/validators/application-validator";
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

export const createStage = createRoute({
  tags,
  path: "/{id}/stages",
  method: "post",
  security: [{ Bearer: [] }],
  request: {
    params: applicationParamsSchema,
    body: jsonContentRequired(
      createStageBodySchema,
      "Payload for creating a new application stage"
    ),
  },
  responses: {
    [StatusCodes.CREATED as 201]: jsonContent(
      selectApplicationStageSchema,
      "The created stage"
    ),
    [StatusCodes.NOT_FOUND as 404]: jsonContent(
      createMessageObjectSchema(ReasonPhrases.NOT_FOUND),
      "Application not found"
    ),
    [StatusCodes.UNPROCESSABLE_ENTITY as 422]: jsonContent(
      createErrorSchema(createStageBodySchema),
      "The validation error(s)"
    ),
    [StatusCodes.UNAUTHORIZED as 401]: jsonContent(
      createMessageObjectSchema(ReasonPhrases.UNAUTHORIZED),
      "The unauthorized error"
    ),
  },
});

export type ListStagesRoute = typeof listStages;
export type CreateStageRoute = typeof createStage;
