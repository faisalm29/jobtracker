DROP INDEX `status_history_application_id_idx`;--> statement-breakpoint
CREATE INDEX `status_history_app_changed_idx` ON `application_status_history` (`application_id`,`changed_at`);--> statement-breakpoint
DROP INDEX `applications_user_id_idx`;--> statement-breakpoint
DROP INDEX `applications_status_idx`;--> statement-breakpoint
CREATE INDEX `applications_user_deleted_date_idx` ON `applications` (`user_id`,`deleted_at`,`applied_date`);--> statement-breakpoint
CREATE INDEX `applications_user_deleted_status_idx` ON `applications` (`user_id`,`deleted_at`,`status`);--> statement-breakpoint
DROP INDEX `application_stages_app_id_idx`;--> statement-breakpoint
ALTER TABLE `application_stages` ADD `updated_at` integer DEFAULT (unixepoch()) NOT NULL;--> statement-breakpoint
CREATE INDEX `application_stages_app_order_idx` ON `application_stages` (`application_id`,`order_index`);