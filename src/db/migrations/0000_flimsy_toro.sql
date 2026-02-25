CREATE TABLE `bookings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`customer_id` integer,
	`customer_name` text NOT NULL,
	`customer_phone` text NOT NULL,
	`customer_email` text,
	`address` text NOT NULL,
	`city` text DEFAULT 'Delhi' NOT NULL,
	`vaccines_requested` text NOT NULL,
	`number_of_people` integer DEFAULT 1 NOT NULL,
	`booking_type` text DEFAULT 'individual' NOT NULL,
	`preferred_date` text,
	`preferred_time` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`admin_notes` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text,
	`address` text,
	`city` text DEFAULT 'Delhi' NOT NULL,
	`notes` text,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `quotes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`booking_id` integer NOT NULL,
	`line_items` text NOT NULL,
	`convenience_fee` real DEFAULT 0 NOT NULL,
	`subtotal` real NOT NULL,
	`gst_amount` real NOT NULL,
	`total` real NOT NULL,
	`valid_until` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`sent_at` integer,
	`approved_at` integer,
	`created_at` integer,
	FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `vaccines` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`brand` text,
	`category` text NOT NULL,
	`description` text,
	`doses_required` integer DEFAULT 1 NOT NULL,
	`interval_days` integer,
	`age_group` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer
);
