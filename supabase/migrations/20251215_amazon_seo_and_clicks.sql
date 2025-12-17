-- Migration: Add SEO tags and click tracking for Amazon affiliate system
-- Date: 2025-12-15

-- =====================================================
-- 1. Add SEO Tags columns to shop_products
-- =====================================================

ALTER TABLE shop_products 
ADD COLUMN IF NOT EXISTS tags_tr TEXT;

ALTER TABLE shop_products 
ADD COLUMN IF NOT EXISTS tags_de TEXT;

ALTER TABLE shop_products 
ADD COLUMN IF NOT EXISTS tags_en TEXT;

-- Add last_checked_at if not exists (for manual price check tracking)
ALTER TABLE shop_products 
ADD COLUMN IF NOT EXISTS last_manual_check TIMESTAMPTZ;

-- =====================================================
-- 2. Create Click Tracking Table
-- =====================================================

CREATE TABLE IF NOT EXISTS shop_product_clicks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES shop_products(id) ON DELETE CASCADE,
    clicked_at TIMESTAMPTZ DEFAULT now(),
    source TEXT, -- 'category', 'home', 'related', 'blog', 'search'
    user_agent TEXT,
    referrer TEXT,
    session_id TEXT -- anonymous session tracking
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_product_clicks_product_id ON shop_product_clicks(product_id);
CREATE INDEX IF NOT EXISTS idx_product_clicks_clicked_at ON shop_product_clicks(clicked_at);

-- Enable RLS
ALTER TABLE shop_product_clicks ENABLE ROW LEVEL SECURITY;

-- Allow inserts from anyone (tracking clicks - anonymous allowed)
DROP POLICY IF EXISTS "Anyone can insert clicks" ON shop_product_clicks;
CREATE POLICY "Anyone can insert clicks" ON shop_product_clicks
    FOR INSERT WITH CHECK (true);

-- Allow select for everyone (stats are public)
DROP POLICY IF EXISTS "Anyone can view clicks" ON shop_product_clicks;
CREATE POLICY "Anyone can view clicks" ON shop_product_clicks
    FOR SELECT USING (true);

-- =====================================================
-- 3. Add click_count to shop_products for quick stats
-- =====================================================

ALTER TABLE shop_products 
ADD COLUMN IF NOT EXISTS click_count INTEGER DEFAULT 0;

-- =====================================================
-- 4. Function to track clicks
-- =====================================================

CREATE OR REPLACE FUNCTION track_product_click(
    p_product_id UUID,
    p_source TEXT DEFAULT 'direct',
    p_user_agent TEXT DEFAULT NULL,
    p_referrer TEXT DEFAULT NULL,
    p_session_id TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    -- Insert click record
    INSERT INTO shop_product_clicks (product_id, source, user_agent, referrer, session_id)
    VALUES (p_product_id, p_source, p_user_agent, p_referrer, p_session_id);
    
    -- Update click count on product
    UPDATE shop_products 
    SET click_count = COALESCE(click_count, 0) + 1
    WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to public
GRANT EXECUTE ON FUNCTION track_product_click TO public;

-- =====================================================
-- 5. View for click statistics (for dashboard)
-- =====================================================

CREATE OR REPLACE VIEW shop_product_click_stats AS
SELECT 
    p.id as product_id,
    p.name_tr,
    p.name_de,
    p.amazon_asin,
    p.click_count,
    COUNT(c.id) as total_clicks,
    COUNT(CASE WHEN c.clicked_at > NOW() - INTERVAL '24 hours' THEN 1 END) as clicks_today,
    COUNT(CASE WHEN c.clicked_at > NOW() - INTERVAL '7 days' THEN 1 END) as clicks_week,
    MAX(c.clicked_at) as last_click
FROM shop_products p
LEFT JOIN shop_product_clicks c ON p.id = c.product_id
WHERE p.product_type = 'amazon'
GROUP BY p.id, p.name_tr, p.name_de, p.amazon_asin, p.click_count
ORDER BY p.click_count DESC NULLS LAST;
