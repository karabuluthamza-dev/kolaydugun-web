-- Add slug column to shop_products
ALTER TABLE shop_products 
ADD COLUMN slug TEXT;

-- Create a function to slugify text
CREATE OR REPLACE FUNCTION slugify(value TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        translate(value, 'ğüşıöçĞÜŞİÖÇ', 'gusiocGUSIOO'), -- Turkish char replacement
        '[^a-zA-Z0-9\s]', '', 'g' -- Remove non-alphanumeric
      ),
      '\s+', '-', 'g' -- Replace spaces with dashes
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Update existing products with slugs
UPDATE shop_products 
SET slug = slugify(COALESCE(name_tr, name_en, name_de, 'product')) || '-' || substr(id::text, 1, 8)
WHERE slug IS NULL;

-- Make slug unique and required (after backfill)
ALTER TABLE shop_products 
ADD CONSTRAINT shop_products_slug_key UNIQUE (slug);
