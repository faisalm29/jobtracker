import { z } from "@hono/zod-openapi";
import { APPLICATION_STATUSES } from "@jobtracker/constants";

export const applicationStatusHistorySchema = z
  .object({
    id: z.uuid().openapi({ example: "123e4567-e89b-12d3-a456-426614174000" }),
    applicationId: z
      .uuid()
      .openapi({ example: "123e4567-e89b-12d3-a456-426614174000" }),
    fromStatus: z.enum(APPLICATION_STATUSES).nullish(),
    toStatus: z.enum(APPLICATION_STATUSES),
    changedAt: z.coerce.date(),
  })
  .openapi("ApplicationStatusHistory");

// Inferred Application Status History
export type ApplicationStatusHistory = z.infer<
  typeof applicationStatusHistorySchema
>;
