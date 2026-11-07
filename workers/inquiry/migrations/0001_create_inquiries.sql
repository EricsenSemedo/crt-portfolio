-- Every Websites form inquiry, saved before the email goes out so a failed send loses nothing.
CREATE TABLE IF NOT EXISTS inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  name TEXT NOT NULL,
  business TEXT NOT NULL DEFAULT '',
  reply TEXT NOT NULL,
  message TEXT NOT NULL,
  page TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'replied', 'archived')),
  email_status TEXT NOT NULL DEFAULT 'pending' CHECK (email_status IN ('pending', 'sent', 'failed')),
  updated_at TEXT
);
CREATE INDEX IF NOT EXISTS inquiries_status_created ON inquiries (status, created_at DESC);
