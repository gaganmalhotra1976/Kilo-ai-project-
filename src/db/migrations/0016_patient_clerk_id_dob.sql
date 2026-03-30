-- Migration 0016: Add clerk_id and date_of_birth to patients table
-- clerk_id links a Clerk auth user to their patient record
-- date_of_birth stored as ISO text (YYYY-MM-DD)

ALTER TABLE patients ADD COLUMN clerk_id TEXT UNIQUE;
ALTER TABLE patients ADD COLUMN date_of_birth TEXT;
