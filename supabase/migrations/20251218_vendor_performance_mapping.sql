-- Create vendor_performance_snapshots table
CREATE TABLE IF NOT EXISTS public.vendor_performance_snapshots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
    snapshot_date DATE NOT NULL,
    
    -- Performance Metrics
    views INTEGER DEFAULT 0,
    unique_users INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,      -- From GSC (Search clicks to that vendor page)
    impressions INTEGER DEFAULT 0, -- From GSC (Search impressions)
    
    -- Metadata
    page_path TEXT, -- e.g., /vendors/salon-x
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Ensure one snapshot per vendor per day
    UNIQUE(vendor_id, snapshot_date)
);

-- Enable RLS
ALTER TABLE public.vendor_performance_snapshots ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can view all vendor snapshots"
    ON public.vendor_performance_snapshots FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Vendors can view their own snapshots"
    ON public.vendor_performance_snapshots FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id FROM public.vendors WHERE id = vendor_id
        )
    );

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_vendor_perf_date ON public.vendor_performance_snapshots(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_vendor_perf_id ON public.vendor_performance_snapshots(vendor_id);

-- Comment
COMMENT ON TABLE public.vendor_performance_snapshots IS 'Stores daily performance metrics for individual vendors, mapped from Google Analytics and Search Console data.';
