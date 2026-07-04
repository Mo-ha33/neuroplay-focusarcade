CREATE TABLE `game_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` varchar(64) NOT NULL,
	`studentName` varchar(128) DEFAULT 'Space Explorer',
	`score` int NOT NULL DEFAULT 0,
	`xp` int NOT NULL DEFAULT 0,
	`starsEarned` int NOT NULL DEFAULT 0,
	`correctCount` int NOT NULL DEFAULT 0,
	`totalPlanets` int NOT NULL DEFAULT 8,
	`timeSpentSec` int NOT NULL DEFAULT 0,
	`attentionDriftCount` int NOT NULL DEFAULT 0,
	`completed` int unsigned NOT NULL DEFAULT 0,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `game_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `planet_attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`planetName` varchar(64) NOT NULL,
	`correct` int unsigned NOT NULL DEFAULT 0,
	`attemptNumber` int NOT NULL DEFAULT 1,
	`xpAwarded` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `planet_attempts_id` PRIMARY KEY(`id`)
);
