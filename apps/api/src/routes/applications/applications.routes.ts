import { selectApplicationSchema } from "@/db/schema";
import { createErrorSchema } from "@/lib/create-error-schema";
import { createMessageObjectSchema } from "@/lib/create-message-object-schema";
import { jsonContent } from "@/lib/json-content";
import { jsonContentRequired } from "@/lib/json-content-required";
import { createApplicationBodySchema } from "@/validators/application-validator";
import { createRoute, z } from "@hono/zod-openapi";
import { StatusCodes } from "http-status-codes";

const tags = ["Applications"];

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

export type CreateRoute = typeof create;
