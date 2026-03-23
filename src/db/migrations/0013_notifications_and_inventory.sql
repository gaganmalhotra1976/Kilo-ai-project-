-- Notifications table
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `customer_id` integer NOT NULL,
  `type` text NOT NULL,
  `title` text NOT NULL,
  `message` text NOT NULL,
  `is_read` integer NOT NULL DEFAULT 0,
  `booking_id` integer,
  `created_at` integer
);

-- Vaccine inventory table
CREATE TABLE IF NOT EXISTS `vaccine_inventory` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `vaccine_id` integer NOT NULL,
  `batch_number` text NOT NULL,
  `expiry_date` text,
  `quantity` integer DEFAULT 0,
  `remaining_quantity` integer DEFAULT 0,
  `purchase_price` real,
  `mrp` real,
  `gst_rate` real DEFAULT 5,
  `is_active` integer DEFAULT 1,
  `created_at` integer
);

-- Add additional charge columns to quotes
ALTER TABLE `quotes` ADD COLUMN `additional_charge_type` text;
ALTER TABLE `quotes` ADD COLUMN `additional_charge_value` real DEFAULT 0;
ALTER TABLE `quotes` ADD COLUMN `additional_charge_description` text;
ALTER TABLE `quotes` ADD COLUMN `additional_charge_amount` real DEFAULT 0;
