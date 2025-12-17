-- =====================================================
-- SHOP PRODUCTS RLS POLİTİKASI - EMAIL EŞLEŞMESİ EKLENİYOR
-- Bu politika hem user_id hem email eşleşmesini kontrol eder
-- =====================================================

-- Mevcut owner politikasını sil
DROP POLICY IF EXISTS "shop_products_owner_all" ON shop_products;

-- Yeni politika: user_id VEYA email eşleşmesi yeterli
CREATE POLICY "shop_products_owner_all" ON shop_products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM shop_accounts 
            WHERE shop_accounts.id = shop_products.shop_account_id 
            AND (
                shop_accounts.user_id = auth.uid()
                OR 
                shop_accounts.email = (SELECT email FROM auth.users WHERE id = auth.uid())
            )
        )
    );

-- shop_accounts için de aynı düzeltme
DROP POLICY IF EXISTS "shop_accounts_owner_all" ON shop_accounts;

CREATE POLICY "shop_accounts_owner_all" ON shop_accounts
    FOR ALL USING (
        user_id = auth.uid()
        OR 
        email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

-- Bonus: shop_custom_categories için de
DROP POLICY IF EXISTS "shop_custom_categories_owner_all" ON shop_custom_categories;

CREATE POLICY "shop_custom_categories_owner_all" ON shop_custom_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM shop_accounts 
            WHERE shop_accounts.id = shop_custom_categories.shop_id 
            AND (
                shop_accounts.user_id = auth.uid()
                OR 
                shop_accounts.email = (SELECT email FROM auth.users WHERE id = auth.uid())
            )
        )
    );
