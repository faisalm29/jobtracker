import { selectApplicationSchema } from "@/db/schema";
import { z } from "@hono/zod-openapi";
import {
  APPLICATION_STATUSES,
  JOB_TYPES,
  SOURCE_CATEGORIES,
  WORKPLACE_TYPES,
} from "@jobtracker/constants";

export const getApplicationsQuerySchema = z.object({
  // SEARCH & FILTER
  search: z.string().optional().openapi({
    description: "Search keyword matching companyName or roleTitle",
    example: "Google",
  }),
  status: z.enum(APPLICATION_STATUSES).optional().openapi({
    description: "Filter by application status",
    example: "applied",
  }),
  sourceCategory: z.enum(SOURCE_CATEGORIES).optional().openapi({
    description: "Filter by source category",
    example: "job_board",
  }),
  sourceName: z.string().optional().openapi({
    description: "Filter by specific source name (eg. LinkedIn, Indeed)",
    example: "LinkedIn",
  }),
  jobType: z.enum(JOB_TYPES).optional().openapi({
    description: "Filter by job type",
    example: "full_time",
  }),
  workplaceType: z.enum(WORKPLACE_TYPES).optional().openapi({
    description: "Filter by workplace arrangement",
    example: "remote",
  }),
  includeDeleted: z
    .preprocess((val: string | boolean | undefined) => {
      if (typeof val === "string") return val === "true";
      return val;
    }, z.boolean().optional().default(false))
    .openapi({
      description: "Include soft-deleted applications",
    }),

  // SORTING
  sortBy: z
    .enum([
      "appliedDate",
      "createdAt",
      "updatedAt",
      "companyName",
      "salary",
      "deadline",
    ])
    .optional()
    .default("appliedDate")
    .openapi({
      description: "Column to sort by",
      example: "appliedDate",
    }),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc").openapi({
    description: "Sort direction",
    example: "desc",
  }),

  // PAGINATION
  page: z.coerce.number().int().positive().optional().default(1).openapi({
    description: "Page number (1-based)",
    example: 1,
  }),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(100)
    .optional()
    .default(20)
    .openapi({
      description: "Number of items per page (max 100)",
      example: 20,
    }),
});

export const paginationMetaSchema = z.object({
  page: z.number().openapi({ example: 1 }),
  limit: z.number().openapi({ example: 1 }),
  totalItems: z.number().openapi({ example: 45 }),
  totalPages: z.number().openapi({ example: 3 }),
  hasNextPage: z.boolean().openapi({ example: true }),
  hasPrevPage: z.boolean().openapi({ example: false }),
});

export const paginatedApplicationsResponseSchema = z.object({
  data: z.array(selectApplicationSchema),
  pagination: paginationMetaSchema,
});

export type GetApplicationsQuery = z.infer<typeof getApplicationsQuerySchema>;
export type PaginatedApplicationsResponse = z.infer<
  typeof paginatedApplicationsResponseSchema
>;
