-- Add is_deep_sync column to scraper_status
ALTER TABLE scraper_status ADD COLUMN IF NOT EXISTS is_deep_sync BOOLEAN DEFAULT false;

-- Update existing record
UPDATE scraper_status SET is_deep_sync = false WHERE id = 'hp24_main';
