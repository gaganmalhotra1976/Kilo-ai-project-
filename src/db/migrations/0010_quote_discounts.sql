-- Migration: Add discount fields to quotes table
-- Add: discountType, discountValue, discountAmount fields for % and flat discounts

ALTER TABLE quotes ADD COLUMN discount_type TEXT; -- percentage | flat | null
ALTER TABLE quotes ADD COLUMN discount_value REAL NOT NULL DEFAULT 0;
ALTER TABLE quotes ADD COLUMN discount_amount REAL NOT NULL DEFAULT 0;
