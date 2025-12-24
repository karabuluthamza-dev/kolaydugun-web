-- =====================================================
-- FIX: SHOP PRODUCTS RLS FOR AMAZON PRODUCTS
-- =====================================================
-- Allows public access to Amazon products which don't have a shop_account_id

-- 1. Drop existing restricted policy
DROP POLICY IF EXISTS "shop_products_select_public" ON shop_products;

-- 2. Create improved policy that accounts for Amazon products
CREATE POLICY "shop_products_select_public" ON shop_products
    FOR SELECT 
    USING (
        status = 'approved' 
        AND (
            -- Amazon products don't need a shop account
            product_type = 'amazon'
            OR 
            -- Other products MUST have an active shop account
            EXISTS (
                SELECT 1 FROM shop_accounts 
                WHERE shop_accounts.id = shop_products.shop_account_id 
                AND shop_accounts.is_active = true
            )
        )
    );

-- 3. Ensure user_notifications are also accessible if needed (though usually they are private)
-- If the 401 persists for user_notifications, it's likely a JWT issue which we handle in secureStorage.

SELECT 'Shop RLS fix applied for Amazon products' as status;
