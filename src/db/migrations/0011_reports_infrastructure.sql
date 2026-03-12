-- Migration: Add assigned_nurse to bookings and create scheduled_reports table
-- Created: 2026-03-11

-- 1. Add assigned_nurse column to bookings table
ALTER TABLE bookings ADD COLUMN assigned_nurse TEXT;

-- 2. Create scheduled_reports table
CREATE TABLE IF NOT EXISTS scheduled_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  name TEXT NOT NULL,
  report_type TEXT NOT NULL,
  schedule TEXT NOT NULL,
  recipient_emails TEXT NOT NULL,
  filters TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  last_sent_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);
