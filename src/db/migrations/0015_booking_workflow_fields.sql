-- Migration: Add booking workflow fields and patient name field to vaccines
-- Add payment_deadline, expires_at, reminder_sent to bookings
-- Add patient_name to vaccines

-- Add new fields to bookings table
ALTER TABLE bookings ADD COLUMN payment_deadline TEXT;
ALTER TABLE bookings ADD COLUMN expires_at TEXT;
ALTER TABLE bookings ADD COLUMN reminder_sent INTEGER NOT NULL DEFAULT 0;

-- Add patient_name to vaccines for easy access
ALTER TABLE vaccines ADD COLUMN patient_name TEXT;