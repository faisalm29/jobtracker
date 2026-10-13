import { createErrorSchema } from "@/lib/create-error-schema";
import { createMessageObjectSchema } from "@/lib/create-message-object-schema";
import { jsonContent } from "@/lib/json-content";
import { jsonContentRequired } from "@/lib/json-content-required";
import {
  applicationSchema,
  paginatedApplicationsSchema,
  createApplicationSchema,
  updateApplicationSchema,
  applicationsQuerySchema,
  applicationParamsSchema,
  applicationDetailSchema,
} from "@jobtracker/schemas";
import { createRoute } from "@hono/zod-openapi";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

const tags = ["Applications"];

export const list = createRoute({
  tags,
  path: "/",
  method: "get",
  security: [{ Bearer: [] }],
  request: {
    query: applicationsQuerySchema,
  },
  responses: {
    [StatusCodes.OK as 200]: jsonContent(
      paginatedApplicationsSchema,
      "List of applications with pagination"
    ),
    [StatusCodes.UNPROCESSABLE_ENTITY as 422]: jsonContent(
      createErrorSchema(applicationsQuerySchema),
      "The validation error(s)"
    ),
    [StatusCodes.UNAUTHORIZED as 401]: jsonContent(
      createMessageObjectSchema(ReasonPhrases.UNAUTHORIZED),
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
      applicationDetailSchema,
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
      createMessageObjectSchema(ReasonPhrases.UNAUTHORIZED),
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
      createApplicationSchema,
      "Payload for creating a new application"
    ),
  },
  responses: {
    [StatusCodes.CREATED as 201]: jsonContent(
      applicationSchema,
      "The created application"
    ),
    [StatusCodes.UNPROCESSABLE_ENTITY as 422]: jsonContent(
      createErrorSchema(createApplicationSchema),
      "The validation error(s)"
    ),
    [StatusCodes.UNAUTHORIZED as 401]: jsonContent(
      createMessageObjectSchema(ReasonPhrases.UNAUTHORIZED),
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
      updateApplicationSchema,
      "Payload for updating the application"
    ),
  },
  responses: {
    [StatusCodes.OK as 200]: jsonContent(
      applicationSchema,
      "The updated application"
    ),
    [StatusCodes.NOT_FOUND as 404]: jsonContent(
      createMessageObjectSchema(ReasonPhrases.NOT_FOUND),
      "Not found error"
    ),
    [StatusCodes.UNPROCESSABLE_ENTITY as 422]: jsonContent(
      createErrorSchema(updateApplicationSchema),
      "The validation error(s)"
    ),
    [StatusCodes.UNAUTHORIZED as 401]: jsonContent(
      createMessageObjectSchema(ReasonPhrases.UNAUTHORIZED),
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
      createMessageObjectSchema(ReasonPhrases.UNAUTHORIZED),
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
      applicationSchema,
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
      createMessageObjectSchema(ReasonPhrases.UNAUTHORIZED),
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
