CREATE TABLE `parcels` (
	`id` text PRIMARY KEY NOT NULL,
	`x` integer NOT NULL,
	`y` integer NOT NULL,
	`level` integer NOT NULL,
	`title` text NOT NULL,
	`sender` text NOT NULL,
	`recipient` text NOT NULL,
	`message` text NOT NULL,
	`color` text NOT NULL,
	`photo` text,
	`caption` text NOT NULL,
	`decorations` text NOT NULL,
	`created` integer NOT NULL,
	`ip_hash` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `spot` ON `parcels` (`x`,`y`,`level`);--> statement-breakpoint
CREATE INDEX `region` ON `parcels` (`level`,`x`,`y`);--> statement-breakpoint
CREATE INDEX `rate` ON `parcels` (`ip_hash`,`created`);