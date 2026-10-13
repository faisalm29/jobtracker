import { z } from "@hono/zod-openapi";
import {
  APPLICATION_STATUSES,
  JOB_TYPES,
  SOURCE_CATEGORIES,
  WORKPLACE_TYPES,
} from "@jobtracker/constants";
import { optionalDate } from "@/lib/optional-date";
import { applicationStageSchema } from "./application-stage";
import { applicationStatusHistorySchema } from "./application-history";
import { paginationMetaSchema } from "./pagination";

export const applicationSchema = z
  .object({
    id: z.uuid().openapi({ example: "123e4567-e89b-12d3-a456-426614174000" }),
    userId: z.string().openapi({ example: "S5W1fuDvslRHUWBtheVh2bWV7CkTRCyk" }),
    companyName: z
      .string()
      .trim()
      .min(1, "Company name is required")
      .max(150)
      .openapi({ example: "Google" }),
    roleTitle: z
      .string()
      .trim()
      .min(1, "Role title is required")
      .max(150)
      .openapi({ example: "Software Engineer" }),
    status: z.enum(APPLICATION_STATUSES).default("saved"),
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
    sourceCategory: z.enum(SOURCE_CATEGORIES).nullish(),
    sourceName: z.string().trim().max(100).nullish(),
    jobType: z.enum(JOB_TYPES).nullish(),
    workplaceType: z.enum(WORKPLACE_TYPES).nullish(),
    location: z.string().trim().max(200).nullish(),
    deadline: optionalDate,
    notes: z.string().max(10000).nullish(),
    appliedDate: optionalDate,
    createdAt: z.coerce.date<string | Date | undefined>(),
    updatedAt: z.coerce.date<string | Date | undefined>(),
    statusChangedAt: z.coerce.date<string | Date | undefined>(),
    deletedAt: optionalDate,
  })
  .openapi("Application");

// Create schema: client doesn't provide server-managed IDs or timestamps
export const createApplicationSchema = applicationSchema
  .omit({
    id: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
    statusChangedAt: true,
    deletedAt: true,
  })
  .openapi("CreateApplication");

// Update schema: all fields optional, but at least 1 field required
export const updateApplicationSchema = createApplicationSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  })
  .openapi("UpdateApplication");

// Combined response for GET /applications/:id
export const applicationDetailSchema = applicationSchema
  .extend({
    stages: z.array(applicationStageSchema),
    statusHistory: z.array(applicationStatusHistorySchema),
  })
  .openapi("ApplicationDetail");

export const paginatedApplicationsSchema = z
  .object({
    data: z.array(applicationSchema),
    pagination: paginationMetaSchema,
  })
  .openapi("PaginatedApplications");

// Inferred Application Types
export type Application = z.infer<typeof applicationSchema>;
export type ApplicationDetail = z.infer<typeof applicationDetailSchema>;
export type PaginatedApplication = z.infer<typeof paginatedApplicationsSchema>;
export type CreateApplicationInput = z.input<typeof createApplicationSchema>;
export type CreateApplicationBody = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationInput = z.input<typeof updateApplicationSchema>;
export type UpdateApplicationBody = z.infer<typeof updateApplicationSchema>;
