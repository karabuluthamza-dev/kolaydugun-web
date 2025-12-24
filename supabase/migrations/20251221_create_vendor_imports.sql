-- Create vendor_imports table for staging scraped data
CREATE TABLE IF NOT EXISTS public.vendor_imports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Source Information
    source_url TEXT NOT NULL,
    source_name TEXT NOT NULL, -- e.g. 'dugun.com', 'google_maps'
    external_id TEXT, -- ID from the source system if available
    collected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Vendor Data (Raw & Normalized)
    business_name TEXT NOT NULL,
    category_raw TEXT, -- e.g. 'Hochzeitsfotograf'
    category_id TEXT, -- Mapped category ID from our system
    city_raw TEXT, -- e.g. 'München'
    city_id UUID, -- Mapped city ID from admin_cities
    address TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    description TEXT,
    price_range TEXT,
    
    -- Status & Workflow
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'duplicate')),
    rejection_reason TEXT,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_vendor_id UUID REFERENCES public.vendors(id), -- If approved and created
    
    -- Duplicate Detection
    duplicate_score INTEGER DEFAULT 0, -- 0-100 confidence score
    possible_duplicate_vendor_id UUID REFERENCES public.vendors(id),
    
    -- Raw Data Storage
    raw_json JSONB DEFAULT '{}'::JSONB
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_vendor_imports_status ON public.vendor_imports(status);
CREATE INDEX IF NOT EXISTS idx_vendor_imports_source_url ON public.vendor_imports(source_url);
CREATE UNIQUE INDEX IF NOT EXISTS idx_vendor_imports_unique_external ON public.vendor_imports(source_name, external_id) WHERE external_id IS NOT NULL;

-- Enable RLS
ALTER TABLE public.vendor_imports ENABLE ROW LEVEL SECURITY;

-- Policies (Admins can do everything)
DROP POLICY IF EXISTS "Allow anonymous inserts for scraper" ON public.vendor_imports;
CREATE POLICY "Allow anonymous inserts for scraper" ON public.vendor_imports
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage vendor imports" ON public.vendor_imports;
CREATE POLICY "Admins can manage vendor imports" ON public.vendor_imports
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );
