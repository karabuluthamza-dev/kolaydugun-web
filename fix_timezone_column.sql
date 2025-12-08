
-- Fix Timezone Issue
-- Convert timestamp columns to TIMESTAMPTZ (Timestamp with Time Zone)
-- This ensures '2025-12-08T10:44:00Z' is stored as UTC and returned as UTC.

ALTER TABLE posts 
ALTER COLUMN scheduled_for TYPE TIMESTAMPTZ 
USING scheduled_for AT TIME ZONE 'UTC';

ALTER TABLE posts 
ALTER COLUMN published_at TYPE TIMESTAMPTZ 
USING published_at AT TIME ZONE 'UTC';

-- Also ensure the trigger function uses NOW() which is TIMESTAMPTZ
CREATE OR REPLACE FUNCTION set_published_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'published' AND (OLD.status IS NULL OR OLD.status != 'published') THEN
        NEW.published_at := COALESCE(NEW.published_at, NOW());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
