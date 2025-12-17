-- Fix: Allow Amazon products without shop_account_id
-- Date: 2025-12-15

-- Make shop_account_id nullable for Amazon products
ALTER TABLE shop_products 
ALTER COLUMN shop_account_id DROP NOT NULL;

-- Add a check constraint to ensure boutique products have shop_account_id
-- but Amazon products can have NULL
ALTER TABLE shop_products
DROP CONSTRAINT IF EXISTS shop_products_require_shop_for_boutique;

ALTER TABLE shop_products
ADD CONSTRAINT shop_products_require_shop_for_boutique
CHECK (
    (product_type = 'amazon' AND shop_account_id IS NULL) OR
    (product_type != 'amazon')
);

-- Update RLS policy to allow admin insert for Amazon products
DROP POLICY IF EXISTS "shop_products_admin_insert_amazon" ON shop_products;
CREATE POLICY "shop_products_admin_insert_amazon" ON shop_products
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );
