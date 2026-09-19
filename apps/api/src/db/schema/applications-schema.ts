import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./auth-schema";
import { z } from "@hono/zod-openapi";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import {
  APPLICATION_STATUSES,
  JOB_TYPES,
  SOURCE_CATEGORIES,
  STAGE_STATUSES,
  STAGE_TYPES,
  WORKPLACE_TYPES,
} from "@/constants/applications";

export const applications = sqliteTable(
  "applications",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    companyName: text("company_name").notNull(),
    roleTitle: text("role_title").notNull(),
    status: text("status", { enum: APPLICATION_STATUSES })
      .notNull()
      .default("saved"),
    salary: integer("salary"),
    currency: text("currency").notNull().default("Rp"),
    jobUrl: text("job_url"),
    sourceCategory: text("source_category", { enum: SOURCE_CATEGORIES }),
    sourceName: text("source_name"),
    jobType: text("job_type", { enum: JOB_TYPES }),
    workplaceType: text("workplace_type", { enum: WORKPLACE_TYPES }),
    location: text("location"),
    deadline: integer("deadline", { mode: "timestamp" }),
    notes: text("notes"),
    appliedDate: integer("applied_date", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`)
      .$onUpdate(() => new Date()),
    statusChangedAt: integer("status_changed_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    deletedAt: integer("deleted_at", { mode: "timestamp" }),
  },
  (table) => [
    index("applications_user_id_idx").on(table.userId),
    index("applications_status_idx").on(table.userId, table.status),
  ]
);

export const applicationsStages = sqliteTable(
  "application_stages",
  {
    id: text("id").primaryKey(),
    applicationId: text("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: text("type", { enum: STAGE_TYPES }).notNull().default("other"),
    status: text("status", { enum: STAGE_STATUSES })
      .notNull()
      .default("pending"),
    scheduledAt: integer("scheduled_at", { mode: "timestamp" }),
    orderIndex: integer("order_index").notNull().default(0),
    notes: text("notes"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [index("application_stages_app_id_idx").on(table.applicationId)]
);

export const applicationStatusHistory = sqliteTable(
  "application_status_history",
  {
    id: text("id").primaryKey(),
    applicationId: text("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    fromStatus: text("from_status", { enum: APPLICATION_STATUSES }),
    toStatus: text("to_status", { enum: APPLICATION_STATUSES }).notNull(),
    changedAt: integer("changed_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    index("status_history_application_id_idx").on(table.applicationId),
    index("status_history_changed_at_idx").on(table.changedAt),
  ]
);

export const applicationsRelations = relations(
  applications,
  ({ one, many }) => ({
    user: one(users, {
      fields: [applications.userId],
      references: [users.id],
    }),
    history: many(applicationStatusHistory),
    stages: many(applicationsStages),
  })
);

export const applicationsStagesRelations = relations(
  applicationsStages,
  ({ one }) => ({
    application: one(applications, {
      fields: [applicationsStages.applicationId],
      references: [applications.id],
    }),
  })
);

export const applicationStatusHistoryRelations = relations(
  applicationStatusHistory,
  ({ one }) => ({
    application: one(applications, {
      fields: [applicationStatusHistory.applicationId],
      references: [applications.id],
    }),
  })
);

export const selectApplicationSchema = createSelectSchema(applications);

export const insertApplicationSchema = createInsertSchema(applications);

export const selectApplicationStageSchema =
  createSelectSchema(applicationsStages);

export const insertApplicationStageSchema =
  createInsertSchema(applicationsStages);

export type Application = z.infer<typeof selectApplicationSchema>;

export type NewApplication = z.infer<typeof insertApplicationSchema>;

export type ApplicationStage = z.infer<typeof selectApplicationStageSchema>;

export type NewApplicationStage = z.infer<typeof insertApplicationStageSchema>;
