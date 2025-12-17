-- Create table for custom affiliate campaigns
CREATE TABLE IF NOT EXISTS shop_affiliate_campaigns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    shop_id UUID REFERENCES shop_accounts(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    slug TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(shop_id, slug)
);

-- Enable RLS
ALTER TABLE shop_affiliate_campaigns ENABLE ROW LEVEL SECURITY;

-- Create policy
DROP POLICY IF EXISTS "Shop owners can manage their own campaigns" ON shop_affiliate_campaigns;
CREATE POLICY "Shop owners can manage their own campaigns" ON shop_affiliate_campaigns
    USING (shop_id IN (SELECT id FROM shop_accounts WHERE user_id = auth.uid()))
    WITH CHECK (shop_id IN (SELECT id FROM shop_accounts WHERE user_id = auth.uid()));

-- Add tracking columns to existing tables
ALTER TABLE shop_affiliate_clicks ADD COLUMN IF NOT EXISTS campaign_slug TEXT;
ALTER TABLE shop_applications ADD COLUMN IF NOT EXISTS affiliate_campaign_slug TEXT;
ALTER TABLE shop_affiliate_earnings ADD COLUMN IF NOT EXISTS campaign_slug TEXT;

-- Index for performance
-- FIXED: Use shop_account_id instead of shop_id for existing table
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_campaign ON shop_affiliate_clicks(shop_account_id, campaign_slug);
CREATE INDEX IF NOT EXISTS idx_applications_campaign ON shop_applications(referred_by_shop_id, affiliate_campaign_slug);
