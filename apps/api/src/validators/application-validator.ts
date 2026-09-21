import {
  insertApplicationSchema,
  insertApplicationStageSchema,
  selectApplicationSchema,
  selectApplicationStageSchema,
  selectApplicationStatusHistorySchema,
} from "@/db/schema";
import { z } from "@hono/zod-openapi";

// Route params: /applications/:id
export const applicationParamsSchema = z.object({
  id: z.string().openapi({
    description: "Application ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
});

// Route params: /applications/:id/stages/stageId
export const stageParamsSchema = z.object({
  id: z.string().openapi({ description: "Application ID" }),
  stageId: z.string().openapi({ description: "Stage ID" }),
});

// Request body: POST /applications (client doesn't send id, userId, or timestamps)
export const createApplicationBodySchema = insertApplicationSchema
  .omit({
    id: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
    statusChangedAt: true,
  })
  .extend({
    appliedDate: z.coerce.date().nullish(),
    deadline: z.coerce.date().nullish(),
  });

// Request body: PATCH /applications/:id
export const updateApplicationBodySchema =
  createApplicationBodySchema.partial();

// Stage validators
export const createStageBodySchema = insertApplicationStageSchema
  .omit({
    id: true,
    createdAt: true,
    applicationId: true,
  })
  .extend({
    scheduledAt: z.coerce.date().nullish(),
  })
  .openapi({
    description: "Payload for creating a new stage",
  });

export const updateStageBodySchema = createStageBodySchema.partial();

export const reorderStagesBodySchema = z.object({
  stageIds: z
    .array(z.string())
    .min(1)
    .refine((items) => new Set(items).size === items.length, {
      message: "Stage IDs must be unique",
    })
    .openapi({
      description: "Array of stage IDs in the desired order",
      example: [
        "123e4567-e89b-12d3-a456-426614174001",
        "123e4567-e89b-12d3-a456-426614174002",
      ],
    }),
});

// Response schema for GET /applications/:id
export const applicationDetailResponseSchema = selectApplicationSchema.extend({
  stages: z.array(selectApplicationStageSchema),
  statusHistory: z.array(selectApplicationStatusHistorySchema),
});

export type CreateApplicationBody = z.infer<typeof createApplicationBodySchema>;
export type UpdateApplicationBody = z.infer<typeof updateApplicationBodySchema>;
export type CreateStageBody = z.infer<typeof createStageBodySchema>;
export type UpdateStageBody = z.infer<typeof updateStageBodySchema>;
export type ReorderStagesBody = z.infer<typeof reorderStagesBodySchema>;
export type ApplicationDetailResponse = z.infer<
  typeof applicationDetailResponseSchema
>;
