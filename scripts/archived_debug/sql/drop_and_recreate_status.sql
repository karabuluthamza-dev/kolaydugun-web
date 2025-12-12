-- Simple fix for status column - just drop and recreate as text

-- 1. Drop the status column completely
ALTER TABLE public.leads DROP COLUMN IF EXISTS status CASCADE;

-- 2. Add it back as text with default
ALTER TABLE public.leads 
ADD COLUMN status text DEFAULT 'new';

-- 3. Verify
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'leads'
  AND column_name = 'status';
