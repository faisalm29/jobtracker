import { z } from "@hono/zod-openapi";
import { STAGE_STATUSES, STAGE_TYPES } from "@jobtracker/constants";

export const applicationStageSchema = z.object({
  id: z.uuid().openapi({ example: "123e4567-e89b-12d3-a456-426614174000" }),
  applicationId: z
    .uuid()
    .openapi({ example: "123e4567-e89b-12d3-a456-426614174000" }),
  name: z
    .string()
    .trim()
    .min(1, "Stage name is required")
    .max(100)
    .openapi({ example: "Technical Interview" }),
  type: z.enum(STAGE_TYPES).nullable(),
  status: z.enum(STAGE_STATUSES),
  scheduledAt: z.iso.datetime().nullable(),
  orderIndex: z.number().int().min(0).default(0),
  notes: z.string().max(5000).nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type ApplicationStage = z.infer<typeof applicationStageSchema>;
