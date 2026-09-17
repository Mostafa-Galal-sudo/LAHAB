-- Preserve authoritative order totals and structured line items. Existing
-- inquiry records remain valid and are parsed through a legacy-safe adapter.
ALTER TABLE inquiries ADD COLUMN orderDataJson TEXT;
ALTER TABLE inquiries ADD COLUMN totalEGP INTEGER;

CREATE INDEX IF NOT EXISTS idx_inquiries_type_timestamp
  ON inquiries(inquiryType, timestamp DESC);
