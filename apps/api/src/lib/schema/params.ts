import { z } from "@hono/zod-openapi";

// Route params: /applications/:id
export const applicationParamsSchema = z
  .object({
    id: z.uuid().openapi({
      description: "Application ID",
      example: "123e4567-e89b-12d3-a456-426614174000",
    }),
  })
  .openapi("applicationParams");

// Route params: /applications/:id/stages/stageId
export const applicationStageParamsSchema = applicationParamsSchema
  .extend({
    stageId: z.uuid().openapi({
      description: "Stage ID",
      example: "123e4567-e89b-12d3-a456-426614174000",
    }),
  })
  .openapi("applicationStageParams");

export type ApplicationParams = z.infer<typeof applicationParamsSchema>;
export type ApplicationStageParams = z.infer<
  typeof applicationStageParamsSchema
>;
