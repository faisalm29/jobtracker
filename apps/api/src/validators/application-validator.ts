import {
  insertApplicationSchema,
  insertApplicationStageSchema,
  selectApplicationSchema,
  selectApplicationStageSchema,
  selectApplicationStatusHistorySchema,
} from "@/db/schema";
import { optionalDate } from "@/lib/optional-date";
import { z } from "@hono/zod-openapi";

// Route params: /applications/:id
export const applicationParamsSchema = z.object({
  id: z.uuid().openapi({
    description: "Application ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
});

// Route params: /applications/:id/stages/stageId
export const stageParamsSchema = z.object({
  id: z.uuid().openapi({
    description: "Application ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
  stageId: z.uuid().openapi({
    description: "Stage ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
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
    companyName: z.string().trim().min(1, "Company name is required").max(150),
    roleTitle: z.string().trim().min(1, "Role title is required").max(150),
    salary: z
      .number()
      .int()
      .nonnegative("Salary cannot be negative")
      .max(100_000_000_000)
      .nullish(),
    currency: z.string().trim().min(1).max(10).default("Rp"),
    jobUrl: z.preprocess(
      (val: string | null | undefined) => (val === "" ? null : val),
      z.url("Invalid job URL").max(2048).nullish()
    ),
    sourceName: z.string().trim().max(100).nullish(),
    location: z.string().trim().max(200).nullish(),
    notes: z.string().max(10000).nullish(),
    appliedDate: optionalDate,
    deadline: optionalDate,
  });

// Request body: PATCH /applications/:id
export const updateApplicationBodySchema = createApplicationBodySchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

// Stage validators
export const createStageBodySchema = insertApplicationStageSchema
  .omit({
    id: true,
    createdAt: true,
    applicationId: true,
  })
  .extend({
    name: z.string().trim().min(1, "Stage name is required").max(100),
    orderIndex: z.number().int().min(0).optional(),
    notes: z.string().max(5000).nullish(),
    scheduledAt: optionalDate,
  });

export const updateStageBodySchema = createStageBodySchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export const reorderStagesBodySchema = z.object({
  stageIds: z
    .array(z.uuid())
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

// what the server receives after zod parses/defaults/transform
export type CreateApplicationBody = z.infer<typeof createApplicationBodySchema>;
// What clients send in the request body
export type CreateApplicationInput = z.input<
  typeof createApplicationBodySchema
>;
export type UpdateApplicationBody = z.infer<typeof updateApplicationBodySchema>;
export type CreateStageBody = z.infer<typeof createStageBodySchema>;
export type UpdateStageBody = z.infer<typeof updateStageBodySchema>;
export type ReorderStagesBody = z.infer<typeof reorderStagesBodySchema>;
export type ApplicationDetailResponse = z.infer<
  typeof applicationDetailResponseSchema
>;
