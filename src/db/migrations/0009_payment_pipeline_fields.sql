-- Migration 0009: Add payment tracking and pipeline source fields
-- Adds payment_status to bookings and source/advance payment fields to pipeline_cards

-- Add payment_status to bookings table
ALTER TABLE bookings ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'unpaid';

-- Add source field to pipeline_cards table
ALTER TABLE pipeline_cards ADD COLUMN source TEXT;

-- Add amount received and payment method for advance tracking
ALTER TABLE pipeline_cards ADD COLUMN amount_received REAL;
ALTER TABLE pipeline_cards ADD COLUMN payment_method TEXT;
