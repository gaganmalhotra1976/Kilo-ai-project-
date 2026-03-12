-- Migration: Quotation System Overhaul
-- Created: 2026-03-12

-- 1. Update vaccines table with inventory fields
ALTER TABLE vaccines ADD COLUMN mrp REAL;
ALTER TABLE vaccines ADD COLUMN stock_quantity INTEGER NOT NULL DEFAULT 0;
ALTER TABLE vaccines ADD COLUMN low_stock_threshold INTEGER NOT NULL DEFAULT 5;
ALTER TABLE vaccines ADD COLUMN gst_rate REAL NOT NULL DEFAULT 18;
ALTER TABLE vaccines ADD COLUMN is_available INTEGER NOT NULL DEFAULT 1;

-- 2. Update quotes table with free consultations
ALTER TABLE quotes ADD COLUMN free_consultations INTEGER NOT NULL DEFAULT 0;
ALTER TABLE quotes ADD COLUMN free_consultations_value REAL NOT NULL DEFAULT 0;

-- 3. Create consultation_vouchers table
CREATE TABLE IF NOT EXISTS consultation_vouchers (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  voucher_code TEXT NOT NULL UNIQUE,
  customer_id INTEGER REFERENCES customers(id),
  patient_name TEXT NOT NULL,
  booking_id INTEGER REFERENCES bookings(id),
  quote_id INTEGER REFERENCES quotes(id),
  issue_date INTEGER NOT NULL,
  expiry_date INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  redeemed_date INTEGER,
  redeemed_by TEXT,
  conversion_type TEXT,
  discount_amount_applied REAL,
  converted_to_booking_id INTEGER REFERENCES bookings(id),
  converted_by TEXT,
  converted_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- 4. Update existing vaccines to set is_available based on stock
UPDATE vaccines SET is_available = CASE WHEN stock_quantity > 0 THEN 1 ELSE 0 END WHERE stock_quantity IS NOT NULL;
