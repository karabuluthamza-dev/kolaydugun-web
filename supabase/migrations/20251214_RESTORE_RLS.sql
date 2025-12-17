-- =====================================================
-- ACİL GERİ ALMA - ORİJİNAL RLS POLİTİKALARINI GERİ YÜKLE
-- =====================================================

-- shop_accounts orijinal politikalar
DROP POLICY IF EXISTS "shop_accounts_owner_all" ON shop_accounts;
DROP POLICY IF EXISTS "shop_accounts_select_public" ON shop_accounts;

CREATE POLICY "shop_accounts_select_public" ON shop_accounts
    FOR SELECT USING (is_active = true);

CREATE POLICY "shop_accounts_owner_all" ON shop_accounts
    FOR ALL USING (user_id = auth.uid());

-- shop_products orijinal politikalar  
DROP POLICY IF EXISTS "shop_products_owner_all" ON shop_products;
DROP POLICY IF EXISTS "shop_products_select_public" ON shop_products;

CREATE POLICY "shop_products_select_public" ON shop_products
    FOR SELECT USING (status = 'approved');

CREATE POLICY "shop_products_owner_all" ON shop_products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM shop_accounts 
            WHERE shop_accounts.id = shop_products.shop_account_id 
            AND shop_accounts.user_id = auth.uid()
        )
    );

-- Admin politikaları (her ihtimale karşı)
DROP POLICY IF EXISTS "shop_accounts_admin_all" ON shop_accounts;
CREATE POLICY "shop_accounts_admin_all" ON shop_accounts
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

DROP POLICY IF EXISTS "shop_products_admin_all" ON shop_products;
CREATE POLICY "shop_products_admin_all" ON shop_products
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );
