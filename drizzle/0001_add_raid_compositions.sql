CREATE TABLE `raid_compositions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text DEFAULT 'Default Roster' NOT NULL,
	`roster_data` text NOT NULL,
	`player_overrides` text DEFAULT '{}',
	`role_mappings` text DEFAULT '{}',
	`updated_at` integer
);
