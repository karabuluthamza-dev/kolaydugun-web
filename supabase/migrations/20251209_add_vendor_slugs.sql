-- Add slug column to vendors table
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS slug text;

-- Create index for faster lookups
CREATE UNIQUE INDEX IF NOT EXISTS vendors_slug_idx ON public.vendors (slug);

-- Function to generate a slug from a string (business_name)
CREATE OR REPLACE FUNCTION public.slugify(value text)
RETURNS text AS $$
BEGIN
  -- Lowercase
  -- Replace non-alphanumeric with hyphen
  -- Remove leading/trailing hyphens
  -- We can use a simple regex or built-in functions. 
  -- For better multi-language support (Turkish characters), we should replace them first.
  
  -- Simple replacement for Turkish chars
  value := replace(value, 'ğ', 'g');
  value := replace(value, 'Ğ', 'g');
  value := replace(value, 'ü', 'u');
  value := replace(value, 'Ü', 'u');
  value := replace(value, 'ş', 's');
  value := replace(value, 'Ş', 's');
  value := replace(value, 'ı', 'i');
  value := replace(value, 'İ', 'i');
  value := replace(value, 'ö', 'o');
  value := replace(value, 'Ö', 'o');
  value := replace(value, 'ç', 'c');
  value := replace(value, 'Ç', 'c');
  
  -- Lowercase and keep only a-z, 0-9, -
  RETURN lower(regexp_replace(regexp_replace(value, '[^a-zA-Z0-9]+', '-', 'g'), '^-+|-+$', '', 'g'));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to handle slug uniqueness on insert/update
CREATE OR REPLACE FUNCTION public.handle_vendor_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug text;
  new_slug text;
  counter integer := 1;
BEGIN
  -- Only generate if slug is null or business_name changed and slug wasn't manually set
  IF NEW.slug IS NULL OR (NEW.business_name <> OLD.business_name AND NEW.slug = OLD.slug) THEN
    base_slug := public.slugify(NEW.business_name);
    
    -- Fallback if slugify returns empty (e.g. name was all special chars)
    IF base_slug IS NULL OR length(base_slug) = 0 THEN
      base_slug := 'vendor';
    END IF;
    
    new_slug := base_slug;
    
    -- Check for collision
    WHILE EXISTS (SELECT 1 FROM public.vendors WHERE slug = new_slug AND id <> NEW.id) LOOP
      new_slug := base_slug || '-' || counter;
      counter := counter + 1;
    END LOOP;
    
    NEW.slug := new_slug;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate slug
DROP TRIGGER IF EXISTS on_vendor_slug_update ON public.vendors;
CREATE TRIGGER on_vendor_slug_update
BEFORE INSERT OR UPDATE ON public.vendors
FOR EACH ROW
EXECUTE FUNCTION public.handle_vendor_slug();

-- Backfill existing vendors (this will trigger the function for each row if we do a dummy update, 
-- or we can run a direct update block. Direct update is safer/cleaner here.)
DO $$
DECLARE
  v record;
  base_slug text;
  final_slug text;
  cnt integer;
BEGIN
  FOR v IN SELECT id, business_name FROM public.vendors WHERE slug IS NULL LOOP
    base_slug := public.slugify(v.business_name);
    if base_slug IS NULL OR length(base_slug) = 0 THEN 
        base_slug := 'vendor';
    END IF;
    
    final_slug := base_slug;
    cnt := 1;
    
    WHILE EXISTS (SELECT 1 FROM public.vendors WHERE slug = final_slug AND id <> v.id) LOOP
      final_slug := base_slug || '-' || cnt;
      cnt := cnt + 1;
    END LOOP;
    
    UPDATE public.vendors SET slug = final_slug WHERE id = v.id;
  END LOOP;
END $$;
