-- Migration 0002: allow inquiries.email to be NULL.
--
-- BUG FIX: found during testing - the /api/checkout endpoint treats email as
-- optional (phone is the primary contact for COD orders in Egypt), but the
-- original schema declared inquiries.email NOT NULL, causing every order
-- submitted without an email address to fail to save with a D1_ERROR.
--
-- SQLite doesn't support `ALTER COLUMN ... DROP NOT NULL` directly, so we
-- recreate the table with the relaxed constraint and copy existing rows over.

CREATE TABLE inquiries_new (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  inquiryType TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  emailStatus TEXT NOT NULL
);

INSERT INTO inquiries_new SELECT id, timestamp, name, email, phone, inquiryType, subject, message, emailStatus FROM inquiries;

DROP TABLE inquiries;
ALTER TABLE inquiries_new RENAME TO inquiries;
