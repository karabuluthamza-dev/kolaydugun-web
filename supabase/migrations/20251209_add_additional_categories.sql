-- Add additional_categories column to vendors table
ALTER TABLE public.vendors 
ADD COLUMN IF NOT EXISTS additional_categories text[] DEFAULT '{}';
