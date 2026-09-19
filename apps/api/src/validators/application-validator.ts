import {
  insertApplicationSchema,
  insertApplicationStageSchema,
} from "@/db/schema";
import { z } from "@hono/zod-openapi";

// Route params: /applications/:id
export const applicationParamsSchema = z.object({
  id: z.string().openapi({
    description: "Application ID",
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
  .openapi({
    description: "Payload for creating a new application",
  });

// Request body: PATCH /applications/:id
export const updateApplicationBodySchema = createApplicationBodySchema
  .partial()
  .openapi({
    description: "Payload for updating an application",
  });

// Stage validators
export const createStageBodySchema = insertApplicationStageSchema
  .omit({
    id: true,
    createdAt: true,
    applicationId: true,
  })
  .openapi({
    description: "Payload for creating a new stage",
  });

export type CreateApplicationBody = z.infer<typeof createApplicationBodySchema>;
export type UpdateApplicationBody = z.infer<typeof updateApplicationBodySchema>;
export type CreateStageBody = z.infer<typeof createStageBodySchema>;
