-- Webhooks system tables

-- Settings table for storing webhook configuration
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  created_at INTEGER,
  updated_at INTEGER
);

-- Webhook logs table for tracking all outbound webhooks
CREATE TABLE IF NOT EXISTS webhook_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event TEXT NOT NULL,
  payload TEXT NOT NULL,
  response_code INTEGER,
  response_body TEXT,
  success INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  triggered_by TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER,
  updated_at INTEGER
);

-- Support tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER REFERENCES customers(id),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'open',
  resolved_at INTEGER,
  created_at INTEGER,
  updated_at INTEGER
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id INTEGER REFERENCES bookings(id),
  amount REAL NOT NULL,
  payment_method TEXT NOT NULL,
  transaction_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  received_at INTEGER,
  created_at INTEGER,
  updated_at INTEGER
);

-- Insert default webhook settings
INSERT OR IGNORE INTO settings (key, value, description, created_at, updated_at) VALUES 
  ('webhook_url', '', 'n8n webhook URL for all events', datetime('now'), datetime('now')),
  ('webhook_secret', '', 'Shared secret key for webhook authentication', datetime('now'), datetime('now'));
