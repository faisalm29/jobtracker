import {
  APPLICATION_STATUSES,
  JOB_TYPES,
  SOURCE_CATEGORIES,
  WORKPLACE_TYPES,
} from "@jobtracker/constants";
import { z } from "@hono/zod-openapi";
import { paginationMetaSchema } from "../common/pagination";
import { applicationStageSchema } from "./stage";
import { applicationStatusHistorySchema } from "./history";

export const applicationSchema = z.object({
  id: z.uuid(),
  userId: z.string(),
  companyName: z.string(),
  roleTitle: z.string(),
  status: z.enum(APPLICATION_STATUSES),
  salary: z.number().int().nullable(),
  currency: z.string(),
  jobUrl: z.url().nullable(),
  sourceCategory: z.enum(SOURCE_CATEGORIES).nullable(),
  sourceName: z.string().nullable(),
  jobType: z.enum(JOB_TYPES).nullable(),
  workplaceType: z.enum(WORKPLACE_TYPES).nullable(),
  location: z.string().nullable(),
  deadline: z.iso.date().nullable(),
  notes: z.string().nullable(),
  appliedDate: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  statusChangedAt: z.iso.datetime(),
  deletedAt: z.iso.datetime().nullable(),
});

export const applicationDetailSchema = applicationSchema.extend({
  stages: z.array(applicationStageSchema),
  statusHistory: z.array(applicationStatusHistorySchema),
});

export const paginatedApplicationsSchema = z.object({
  data: z.array(applicationSchema),
  pagination: paginationMetaSchema,
});

export const createApplicationSchema = applicationSchema
  .extend({
    companyName: z
      .string()
      .trim()
      .min(1, "Company name is required")
      .max(150)
      .openapi({
        example: "Google",
      }),
    roleTitle: z
      .string()
      .trim()
      .min(1, "Role title is required")
      .max(150)
      .openapi({
        example: "Software Engineer",
      }),
    status: z.enum(APPLICATION_STATUSES).optional(),
    salary: z
      .number()
      .int()
      .nonnegative("Salary cannot be negative")
      .max(1_000_000_000)
      .transform((val) => (val === 0 ? null : val))
      .nullish(),
    currency: z.string().trim().min(1).max(10).optional(),
    jobUrl: z.preprocess(
      (val: string | null | undefined) => (val === "" ? null : val),
      z.url("Job URL must be a valid URL").max(2048).nullish()
    ),
    sourceCategory: z.enum(SOURCE_CATEGORIES).nullish(),
    sourceName: z
      .string()
      .trim()
      .max(100)
      .transform((val) => (val === "" ? null : val))
      .nullish(),
    jobType: z.enum(JOB_TYPES).nullish(),
    workplaceType: z.enum(WORKPLACE_TYPES).nullish(),
    location: z
      .string()
      .trim()
      .max(200)
      .transform((val) => (val === "" ? null : val))
      .nullish(),
    deadline: z.iso
      .datetime()
      .transform((val) => new Date(val))
      .nullish(),
    notes: z
      .string()
      .max(2000)
      .transform((val) => (val === "" ? null : val))
      .nullish(),
    appliedDate: z.iso
      .datetime()
      .transform((val) => new Date(val))
      .nullish(),
  })
  .omit({
    id: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
    statusChangedAt: true,
    deletedAt: true,
  });

export const updateApplicationSchema = createApplicationSchema.partial();

export type PaginatedApplications = z.infer<typeof paginatedApplicationsSchema>;
export type Application = z.infer<typeof applicationSchema>;
export type CreateApplication = z.input<typeof createApplicationSchema>;
export type UpdateApplication = z.infer<typeof updateApplicationSchema>;
