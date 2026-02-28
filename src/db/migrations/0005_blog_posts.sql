CREATE TABLE `blog_posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`excerpt` text,
	`content` text NOT NULL,
	`cover_image_url` text,
	`meta_title` text,
	`meta_description` text,
	`meta_keywords` text,
	`author` text DEFAULT 'The Vaccine Panda Team' NOT NULL,
	`category` text,
	`tags` text,
	`is_published` integer DEFAULT false NOT NULL,
	`published_at` integer,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `blog_posts_slug_unique` ON `blog_posts` (`slug`);
