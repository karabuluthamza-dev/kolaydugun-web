-- Create admin_city_aliases table for mapping external city names
CREATE TABLE IF NOT EXISTS public.admin_city_aliases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alias_name TEXT NOT NULL, -- e.g. 'Cologne', 'Köln-Ehrenfeld'
    target_city_id UUID REFERENCES public.admin_cities(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Prevent duplicate aliases
    UNIQUE(alias_name)
);

-- Enable RLS
ALTER TABLE public.admin_city_aliases ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Admins can manage aliases" ON public.admin_city_aliases;
CREATE POLICY "Admins can manage aliases" ON public.admin_city_aliases
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Public read aliases" ON public.admin_city_aliases;
CREATE POLICY "Public read aliases" ON public.admin_city_aliases
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_city_aliases_name ON public.admin_city_aliases(alias_name);
