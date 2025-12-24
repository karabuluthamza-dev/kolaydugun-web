-- ============================================
-- Competitor Vendor Poaching & Interception System
-- ============================================

-- 1. Extend vendors table
ALTER TABLE public.vendors 
ADD COLUMN IF NOT EXISTS raw_city_name TEXT,
ADD COLUMN IF NOT EXISTS is_poached BOOLEAN DEFAULT false;

-- 2. Create poached_inquiries table
CREATE TABLE IF NOT EXISTS public.poached_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
    sender_name TEXT NOT NULL,
    sender_email TEXT NOT NULL,
    sender_phone TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'forwarded', 'rejected', 'archived')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create city_aliases table
CREATE TABLE IF NOT EXISTS public.city_aliases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alias_name TEXT NOT NULL UNIQUE, -- Case insensitive matching might be better but let's stick to base
    target_city_id INTEGER, -- Link to your location system's city ID
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.poached_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.city_aliases ENABLE ROW LEVEL SECURITY;

-- Policies for poached_inquiries
CREATE POLICY "Admins can manage poached_inquiries"
    ON public.poached_inquiries FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Policies for city_aliases
CREATE POLICY "Admins can manage city_aliases"
    ON public.city_aliases FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Allow public to insert into poached_inquiries
CREATE POLICY "Anyone can submit inquiry for poached vendors"
    ON public.poached_inquiries FOR INSERT
    WITH CHECK (true);

-- Indexes
CREATE INDEX idx_poached_inquiries_vendor ON public.poached_inquiries(vendor_id);
CREATE INDEX idx_poached_inquiries_status ON public.poached_inquiries(status);
CREATE INDEX idx_city_aliases_name ON public.city_aliases(alias_name);
