-- Migration: Add clerk_id and date_of_birth columns to patients table
-- Links Clerk authenticated users to patient records and adds DOB field

ALTER TABLE patients ADD COLUMN clerk_id TEXT;
ALTER TABLE patients ADD COLUMN date_of_birth TEXT;