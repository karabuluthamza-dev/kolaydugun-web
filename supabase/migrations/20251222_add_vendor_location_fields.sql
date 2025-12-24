-- ============================================
-- Add State and Country columns to Vendors table
-- Purpose: Allow filtering by region and displaying full location info
-- ============================================

ALTER TABLE public.vendors 
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'DE';

-- Add index for location-based filtering performance
CREATE INDEX IF NOT EXISTS idx_vendors_state ON public.vendors(state);
CREATE INDEX IF NOT EXISTS idx_vendors_country ON public.vendors(country);

-- Comments
COMMENT ON COLUMN public.vendors.state IS 'Federated state or region code (e.g., NW, BY, SN)';
COMMENT ON COLUMN public.vendors.country IS 'ISO country code (e.g., DE, AT, CH)';
