-- ============================================
-- Add Contact Fields to Vendors Table
-- Purpose: Allow storing directory-level contact info for all vendors (including unclaimed imports)
-- ============================================

ALTER TABLE public.vendors 
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT;

-- Add indexes for search performance
CREATE INDEX IF NOT EXISTS idx_vendors_contact_email ON public.vendors(contact_email);
CREATE INDEX IF NOT EXISTS idx_vendors_contact_phone ON public.vendors(contact_phone);

-- Comments
COMMENT ON COLUMN public.vendors.contact_email IS 'Direct contact email for the business (useful for directory listings and imports)';
COMMENT ON COLUMN public.vendors.contact_phone IS 'Direct contact phone for the business (useful for directory listings and imports)';
