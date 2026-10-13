import { z } from "@hono/zod-openapi";
import {
  APPLICATION_STATUSES,
  ApplicationStatus,
  JOB_TYPES,
  SOURCE_CATEGORIES,
  WORKPLACE_TYPES,
} from "@jobtracker/constants";

export const applicationsQuerySchema = z
  .object({
    // SEARCH & FILTER
    search: z.string().trim().max(100).optional().openapi({
      description: "Search keyword matching companyName or roleTitle",
      example: "Google",
    }),
    status: z
      .preprocess(
        (
          val:
            | ApplicationStatus
            | ApplicationStatus[]
            | string
            | string[]
            | undefined
        ) => {
          if (typeof val === "string") {
            // Splits "applied,in_progress" into ["applied", "in_progress"]
            return val
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
          }
          return val;
        },
        z.array(z.enum(APPLICATION_STATUSES))
      )
      .optional()
      .openapi({
        type: "string",
        description: `Filter by one or more statuses (comma-separated, e.g. applied,in_progress). Allowed: ${APPLICATION_STATUSES.join(", ")}`,
        example: "applied,in_progress",
      }),
    sourceCategory: z.enum(SOURCE_CATEGORIES).optional().openapi({
      description: "Filter by source category",
      example: "job_board",
    }),
    sourceName: z.string().trim().max(100).optional().openapi({
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
        type: "boolean",
        description: "Include soft-deleted applications",
        example: false,
      }),

    // DATE RANGE
    appliedFrom: z.preprocess(
      (val: string | undefined) => (val === "" ? undefined : val),
      z.iso.date().optional().openapi({
        description:
          "Filter applications applied on or after this date (ISO 8601 or YYYY-MM-DD)",
        example: "2026-01-01",
      })
    ),
    appliedTo: z.preprocess(
      (val: string | undefined) => (val === "" ? undefined : val),
      z.iso.date().optional().openapi({
        description:
          "Filter applications applied on or before this date (ISO 8601 or YYYY-MM-DD)",
        example: "2026-03-31",
      })
    ),
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
    page: z.coerce
      .number<string | number | undefined>()
      .int()
      .positive()
      .optional()
      .default(1)
      .openapi({
        description: "Page number (1-based)",
        example: 1,
      }),
    limit: z.coerce
      .number<string | number | undefined>()
      .int()
      .positive()
      .max(100)
      .optional()
      .default(20)
      .openapi({
        description: "Number of items per page (max 100)",
        example: 20,
      }),
  })
  .openapi("ApplicationsQuery");

export type ApplicationsQuery = z.infer<typeof applicationsQuerySchema>;
