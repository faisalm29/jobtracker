import { selectApplicationSchema } from "@/db/schema";
import { createErrorSchema } from "@/lib/create-error-schema";
import { createMessageObjectSchema } from "@/lib/create-message-object-schema";
import { jsonContent } from "@/lib/json-content";
import { jsonContentRequired } from "@/lib/json-content-required";
import {
  applicationDetailResponseSchema,
  applicationParamsSchema,
  createApplicationBodySchema,
  updateApplicationBodySchema,
} from "@/validators/application-validator";
import {
  getApplicationsQuerySchema,
  paginatedApplicationsResponseSchema,
} from "@/validators/query-validator";
import { createRoute, z } from "@hono/zod-openapi";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

const tags = ["Applications"];

export const list = createRoute({
  tags,
  path: "/",
  method: "get",
  security: [{ Bearer: [] }],
  request: {
    query: getApplicationsQuerySchema,
  },
  responses: {
    [StatusCodes.OK as 200]: jsonContent(
      paginatedApplicationsResponseSchema,
      "List of applications with pagination"
    ),
    [StatusCodes.UNPROCESSABLE_ENTITY as 422]: jsonContent(
      createErrorSchema(getApplicationsQuerySchema),
      "The validation error(s)"
    ),
    [StatusCodes.UNAUTHORIZED as 401]: jsonContent(
      createMessageObjectSchema("Unauthorized"),
      "The unauthorized error"
    ),
  },
});

export const getOne = createRoute({
  tags,
  path: "/{id}",
  method: "get",
  security: [{ Bearer: [] }],
  request: {
    params: applicationParamsSchema,
  },
  responses: {
    [StatusCodes.OK as 200]: jsonContent(
      applicationDetailResponseSchema,
      "The application details with stages and status history"
    ),
    [StatusCodes.NOT_FOUND as 404]: jsonContent(
      createMessageObjectSchema(ReasonPhrases.NOT_FOUND),
      "Not found error"
    ),
    [StatusCodes.UNPROCESSABLE_ENTITY as 422]: jsonContent(
      createErrorSchema(applicationParamsSchema),
      "The validation error(s)"
    ),
    [StatusCodes.UNAUTHORIZED as 401]: jsonContent(
      createMessageObjectSchema("Unauthorized"),
      "The unauthorized error"
    ),
  },
});

export const create = createRoute({
  tags,
  path: "/",
  method: "post",
  security: [{ Bearer: [] }],
  request: {
    body: jsonContentRequired(
      createApplicationBodySchema,
      "Payload for creating a new application"
    ),
  },
  responses: {
    [StatusCodes.CREATED as 201]: jsonContent(
      selectApplicationSchema,
      "The created application"
    ),
    [StatusCodes.UNPROCESSABLE_ENTITY as 422]: jsonContent(
      createErrorSchema(createApplicationBodySchema),
      "The validation error(s)"
    ),
    [StatusCodes.UNAUTHORIZED as 401]: jsonContent(
      createMessageObjectSchema("Unauthorized"),
      "The unauthorized error"
    ),
  },
});

export const patch = createRoute({
  tags,
  path: "/{id}",
  method: "patch",
  security: [{ Bearer: [] }],
  request: {
    params: applicationParamsSchema,
    body: jsonContentRequired(
      updateApplicationBodySchema,
      "Payload for updating the application"
    ),
  },
  responses: {
    [StatusCodes.OK as 200]: jsonContent(
      selectApplicationSchema,
      "The updated application"
    ),
    [StatusCodes.NOT_FOUND as 404]: jsonContent(
      createMessageObjectSchema(ReasonPhrases.NOT_FOUND),
      "Not found error"
    ),
    [StatusCodes.UNPROCESSABLE_ENTITY as 422]: jsonContent(
      createErrorSchema(updateApplicationBodySchema),
      "The validation error(s)"
    ),
    [StatusCodes.UNAUTHORIZED as 401]: jsonContent(
      createMessageObjectSchema("Unauthorized"),
      "The unauthorized error"
    ),
  },
});

export const remove = createRoute({
  tags,
  path: "/{id}",
  method: "delete",
  security: [{ Bearer: [] }],
  request: {
    params: applicationParamsSchema,
  },
  responses: {
    [StatusCodes.NO_CONTENT as 204]: {
      description: "Application deleted",
    },
    [StatusCodes.NOT_FOUND as 404]: jsonContent(
      createMessageObjectSchema(ReasonPhrases.NOT_FOUND),
      "Not found error"
    ),
    [StatusCodes.UNPROCESSABLE_ENTITY as 422]: jsonContent(
      createErrorSchema(applicationParamsSchema),
      "The validation error(s)"
    ),
    [StatusCodes.UNAUTHORIZED as 401]: jsonContent(
      createMessageObjectSchema("Unauthorized"),
      "The unauthorized error"
    ),
  },
});

export const restore = createRoute({
  tags,
  path: "/{id}/restore",
  method: "post",
  security: [{ Bearer: [] }],
  request: {
    params: applicationParamsSchema,
  },
  responses: {
    [StatusCodes.OK as 200]: jsonContent(
      selectApplicationSchema,
      "The restored application"
    ),
    [StatusCodes.NOT_FOUND as 404]: jsonContent(
      createMessageObjectSchema(ReasonPhrases.NOT_FOUND),
      "Not found error"
    ),
    [StatusCodes.UNPROCESSABLE_ENTITY as 422]: jsonContent(
      createErrorSchema(applicationParamsSchema),
      "The validation error(s)"
    ),
    [StatusCodes.UNAUTHORIZED as 401]: jsonContent(
      createMessageObjectSchema("Unauthorized"),
      "The unauthorized error"
    ),
  },
});

export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type ListRoute = typeof list;
export type PatchRoute = typeof patch;
export type RemoveRoute = typeof remove;
export type RestoreRoute = typeof restore;
