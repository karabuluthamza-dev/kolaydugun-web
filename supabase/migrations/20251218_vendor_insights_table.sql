-- Create vendor_insights table
CREATE TABLE IF NOT EXISTS public.vendor_insights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
    
    -- AI Generated Content
    summary TEXT NOT NULL,
    recommendations JSONB DEFAULT '[]'::jsonb,
    
    -- Snapshotted Metrics at time of insight
    metrics JSONB DEFAULT '{}'::jsonb,
    performance_score INTEGER CHECK (performance_score >= 0 AND performance_score <= 100),
    
    -- Status
    is_published BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vendor_insights ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can manage all insights"
    ON public.vendor_insights FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Vendors can view their own published insights"
    ON public.vendor_insights FOR SELECT
    USING (
        is_published = true AND
        auth.uid() IN (
            SELECT user_id FROM public.vendors WHERE id = vendor_id
        )
    );

-- Index for lookup
CREATE INDEX IF NOT EXISTS idx_vendor_insights_vendor_id ON public.vendor_insights(vendor_id);

-- Comment
COMMENT ON TABLE public.vendor_insights IS 'Stores premium AI-generated performance reports shared by admins with vendors.';
