-- Fix missing unique constraint on vendor_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'vendor_insights_vendor_id_key'
    ) THEN
        ALTER TABLE public.vendor_insights ADD CONSTRAINT vendor_insights_vendor_id_key UNIQUE(vendor_id);
    END IF;
END $$;
