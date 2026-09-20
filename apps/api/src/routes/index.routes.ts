import { createRoute } from "@hono/zod-openapi";
import { StatusCodes } from "http-status-codes";
import { jsonContent } from "../lib/json-content";
import { createMessageObjectSchema } from "@/lib/create-message-object-schema";
import { createRouter } from "../lib/create-router";

const tags = ["Index"];

const router = createRouter().openapi(
  createRoute({
    tags,
    method: "get",
    path: "/",
    responses: {
      [StatusCodes.OK as 200]: jsonContent(
        createMessageObjectSchema("Job Applications Tracker API"),
        "Job Applications Tracker API"
      ),
    },
  }),
  (c) => {
    return c.json(
      {
        message: "Job Applications Tracker API",
      },
      StatusCodes.OK
    );
  }
);

export default router;
