-- Async Amazon Product Cache Table
-- Products are cached after Apify fetches them asynchronously

CREATE TABLE IF NOT EXISTS shop_amazon_product_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asin TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
    
    -- Product Data (populated when completed)
    name_tr TEXT,
    name_de TEXT,
    name_en TEXT,
    description_tr TEXT,
    description_de TEXT,
    description_en TEXT,
    price DECIMAL(10,2),
    price_raw JSONB,
    images TEXT[],
    affiliate_url TEXT,
    is_available BOOLEAN DEFAULT true,
    
    -- Metadata
    apify_run_id TEXT, -- For tracking Apify runs
    error_message TEXT, -- If failed
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours' -- Cache for 24 hours
);

-- Index for fast ASIN lookups
CREATE INDEX IF NOT EXISTS idx_amazon_cache_asin ON shop_amazon_product_cache(asin);
CREATE INDEX IF NOT EXISTS idx_amazon_cache_status ON shop_amazon_product_cache(status);
CREATE INDEX IF NOT EXISTS idx_amazon_cache_expires ON shop_amazon_product_cache(expires_at);

-- RLS Policies
ALTER TABLE shop_amazon_product_cache ENABLE ROW LEVEL SECURITY;

-- Anyone can read cache
CREATE POLICY "Anyone can read amazon cache"
    ON shop_amazon_product_cache FOR SELECT
    USING (true);

-- Only service role can insert/update (Edge Functions)
CREATE POLICY "Service can manage amazon cache"
    ON shop_amazon_product_cache FOR ALL
    USING (auth.role() = 'service_role');

-- Function to clean expired cache entries
CREATE OR REPLACE FUNCTION clean_expired_amazon_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM shop_amazon_product_cache
    WHERE expires_at < NOW();
END;
$$;
