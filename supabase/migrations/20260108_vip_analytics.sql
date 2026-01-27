-- VIP Demo Analytics Table
-- Tracks page views, clicks, and interactions on VIP Demo pages

CREATE TABLE IF NOT EXISTS vip_demo_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    venue_name TEXT NOT NULL,
    city TEXT,
    event_type TEXT NOT NULL, -- 'view', 'dashboard_click', 'whatsapp_click', 'claim_click'
    referrer TEXT,
    user_agent TEXT,
    ip_hash TEXT, -- For unique visitor counting (hashed for privacy)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_vip_analytics_vendor ON vip_demo_analytics(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vip_analytics_event ON vip_demo_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_vip_analytics_venue ON vip_demo_analytics(venue_name);
CREATE INDEX IF NOT EXISTS idx_vip_analytics_created ON vip_demo_analytics(created_at);

-- Add follow-up tracking columns to vendors
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS last_contact_at TIMESTAMPTZ;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS follow_up_count INTEGER DEFAULT 0;

-- RLS Policies
ALTER TABLE vip_demo_analytics ENABLE ROW LEVEL SECURITY;

-- Anyone can insert analytics (public tracking)
CREATE POLICY "Anyone can insert analytics"
    ON vip_demo_analytics FOR INSERT
    WITH CHECK (true);

-- Everyone can read analytics (for War Room to display stats)
-- Admin check is done at application level
CREATE POLICY "Anyone can read analytics"
    ON vip_demo_analytics FOR SELECT
    USING (true);

-- Aggregation function for War Room
CREATE OR REPLACE FUNCTION get_vip_demo_stats(p_vendor_id UUID)
RETURNS TABLE (
    total_views BIGINT,
    dashboard_clicks BIGINT,
    whatsapp_clicks BIGINT,
    claim_clicks BIGINT,
    is_hot_lead BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) FILTER (WHERE event_type = 'view') AS total_views,
        COUNT(*) FILTER (WHERE event_type = 'dashboard_click') AS dashboard_clicks,
        COUNT(*) FILTER (WHERE event_type = 'whatsapp_click') AS whatsapp_clicks,
        COUNT(*) FILTER (WHERE event_type = 'claim_click') AS claim_clicks,
        (COUNT(*) FILTER (WHERE event_type IN ('whatsapp_click', 'claim_click')) > 0) AS is_hot_lead
    FROM vip_demo_analytics
    WHERE vendor_id = p_vendor_id;
END;
$$;

-- Function to get stats by venue name (for unlinked vendors)
CREATE OR REPLACE FUNCTION get_vip_demo_stats_by_name(p_venue_name TEXT)
RETURNS TABLE (
    total_views BIGINT,
    dashboard_clicks BIGINT,
    whatsapp_clicks BIGINT,
    claim_clicks BIGINT,
    is_hot_lead BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) FILTER (WHERE event_type = 'view') AS total_views,
        COUNT(*) FILTER (WHERE event_type = 'dashboard_click') AS dashboard_clicks,
        COUNT(*) FILTER (WHERE event_type = 'whatsapp_click') AS whatsapp_clicks,
        COUNT(*) FILTER (WHERE event_type = 'claim_click') AS claim_clicks,
        (COUNT(*) FILTER (WHERE event_type IN ('whatsapp_click', 'claim_click')) > 0) AS is_hot_lead
    FROM vip_demo_analytics
    WHERE venue_name = p_venue_name;
END;
$$;
