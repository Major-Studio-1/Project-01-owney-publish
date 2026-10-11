CREATE TABLE `visitor_tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`submission_id` text NOT NULL,
	`city` text NOT NULL,
	`message` text NOT NULL,
	`created_at` integer NOT NULL,
	`requester_hash` text NOT NULL
);

--> statement-breakpoint
CREATE UNIQUE INDEX `idx_visitor_tags_submission_id` ON `visitor_tags` (`submission_id`);
--> statement-breakpoint
CREATE INDEX `idx_visitor_tags_requester_time` ON `visitor_tags` (`requester_hash`,`created_at`);
