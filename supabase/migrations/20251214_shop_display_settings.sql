-- =====================================================
-- Shop Account Display Settings Migration
-- Tedarikçilerin ürün sayfası görüntüleme ayarları
-- =====================================================

-- Add display_settings JSONB column to shop_accounts
ALTER TABLE shop_accounts
ADD COLUMN IF NOT EXISTS display_settings JSONB DEFAULT '{
    "show_view_count": true,
    "show_live_viewers": false,
    "show_stock_badge": false,
    "show_trust_badges": true
}'::jsonb;

-- Update existing records with default values
UPDATE shop_accounts
SET display_settings = '{
    "show_view_count": true,
    "show_live_viewers": false,
    "show_stock_badge": false,
    "show_trust_badges": true
}'::jsonb
WHERE display_settings IS NULL;

-- Add comment
COMMENT ON COLUMN shop_accounts.display_settings IS 'JSON object containing display preferences for product pages: show_view_count, show_live_viewers, show_stock_badge, show_trust_badges';
