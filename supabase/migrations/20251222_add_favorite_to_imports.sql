-- Add is_favorite column to vendor_imports
ALTER TABLE public.vendor_imports 
ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false;

-- Add index for filtering by favorites
CREATE INDEX IF NOT EXISTS idx_vendor_imports_favorite ON public.vendor_imports(is_favorite) WHERE is_favorite = true;
