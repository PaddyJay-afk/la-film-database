CREATE TABLE `film_streaming` (
	`id` int AUTO_INCREMENT NOT NULL,
	`filmId` int NOT NULL,
	`platformId` int NOT NULL,
	`url` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `film_streaming_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `film_submissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`filmTitle` varchar(255) NOT NULL,
	`status` enum('pending','approved','rejected','duplicate') NOT NULL DEFAULT 'pending',
	`notes` text,
	`processedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `film_submissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `films` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`year` int NOT NULL,
	`synopsis` text,
	`genres` varchar(500),
	`imdbId` varchar(20),
	`imdbUrl` varchar(500),
	`imdbRating` varchar(10),
	`rottenTomatoesScore` varchar(10),
	`posterUrl` varchar(500),
	`posterUrl2` varchar(500),
	`directors` text,
	`cast` text,
	`runtime` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `films_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`filmId` int NOT NULL,
	`source` varchar(100),
	`author` varchar(255),
	`rating` varchar(10),
	`text` text,
	`url` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `streaming_platforms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`color` varchar(7),
	`icon` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `streaming_platforms_id` PRIMARY KEY(`id`),
	CONSTRAINT `streaming_platforms_name_unique` UNIQUE(`name`),
	CONSTRAINT `streaming_platforms_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `film_streaming` ADD CONSTRAINT `film_streaming_filmId_films_id_fk` FOREIGN KEY (`filmId`) REFERENCES `films`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `film_streaming` ADD CONSTRAINT `film_streaming_platformId_streaming_platforms_id_fk` FOREIGN KEY (`platformId`) REFERENCES `streaming_platforms`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `film_submissions` ADD CONSTRAINT `film_submissions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_filmId_films_id_fk` FOREIGN KEY (`filmId`) REFERENCES `films`(`id`) ON DELETE cascade ON UPDATE no action;