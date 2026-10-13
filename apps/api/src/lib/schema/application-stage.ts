import { z } from "@hono/zod-openapi";
import { STAGE_STATUSES, STAGE_TYPES } from "@jobtracker/constants";
import { optionalDate } from "@/lib/optional-date";

export const applicationStageSchema = z
  .object({
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
    type: z.enum(STAGE_TYPES).default("other"),
    status: z.enum(STAGE_STATUSES).default("pending"),
    scheduledAt: optionalDate,
    orderIndex: z.number().int().min(0).default(0),
    notes: z.string().max(5000).nullish(),
    createdAt: z.coerce.date<string | Date | undefined>(),
    updatedAt: z.coerce.date<string | Date | undefined>(),
  })
  .openapi("ApplicationStage");

export const createApplicationStageSchema = applicationStageSchema
  .omit({
    id: true,
    applicationId: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    orderIndex: z.number().int().min(0).optional(),
  })
  .openapi("CreateApplicationStage");

export const updateApplicationStageSchema = createApplicationStageSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  })
  .openapi("UpdateApplicationStage");

export const reorderApplicationStagesSchema = z
  .object({
    stageIds: z
      .array(z.uuid())
      .min(1, "At least one stage ID is required")
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
  })
  .openapi("ReorderStages");

// Inferred Stage Types
export type ApplicationStage = z.infer<typeof applicationStageSchema>;
export type CreateApplicationStageInput = z.input<
  typeof createApplicationStageSchema
>;
export type CreateApplicationStageBody = z.infer<
  typeof createApplicationStageSchema
>;
export type UpdateApplicationStageInput = z.input<
  typeof updateApplicationStageSchema
>;
export type UpdateApplicationStageBody = z.infer<
  typeof updateApplicationStageSchema
>;
export type ReorderStagesInput = z.input<typeof reorderApplicationStagesSchema>;
