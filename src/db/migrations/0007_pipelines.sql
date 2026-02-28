-- Pipeline Builder tables

CREATE TABLE IF NOT EXISTS pipelines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  is_archived INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER,
  updated_at INTEGER
);

CREATE TABLE IF NOT EXISTS pipeline_stages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pipeline_id INTEGER NOT NULL REFERENCES pipelines(id),
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER
);

CREATE TABLE IF NOT EXISTS pipeline_cards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pipeline_id INTEGER NOT NULL REFERENCES pipelines(id),
  stage_id INTEGER NOT NULL REFERENCES pipeline_stages(id),
  title TEXT NOT NULL,
  customer_id INTEGER REFERENCES customers(id),
  customer_name TEXT,
  assigned_to TEXT,
  due_date TEXT,
  priority TEXT NOT NULL DEFAULT 'medium',
  notes TEXT,
  attachments TEXT,
  booking_id INTEGER REFERENCES bookings(id),
  quote_id INTEGER REFERENCES quotes(id),
  is_archived INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER,
  updated_at INTEGER
);

CREATE TABLE IF NOT EXISTS pipeline_card_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  card_id INTEGER NOT NULL REFERENCES pipeline_cards(id),
  from_stage_id INTEGER REFERENCES pipeline_stages(id),
  to_stage_id INTEGER NOT NULL REFERENCES pipeline_stages(id),
  moved_by TEXT,
  moved_at INTEGER,
  note TEXT
);

CREATE TABLE IF NOT EXISTS pipeline_custom_fields (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pipeline_id INTEGER NOT NULL REFERENCES pipelines(id),
  name TEXT NOT NULL,
  field_type TEXT NOT NULL DEFAULT 'text',
  options TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER
);

CREATE TABLE IF NOT EXISTS pipeline_card_field_values (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  card_id INTEGER NOT NULL REFERENCES pipeline_cards(id),
  field_id INTEGER NOT NULL REFERENCES pipeline_custom_fields(id),
  value TEXT,
  updated_at INTEGER
);
