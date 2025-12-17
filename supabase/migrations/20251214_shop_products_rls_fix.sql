-- =====================================================
-- SHOP PRODUCTS RLS FIX
-- =====================================================
-- Public kullanıcıların onaylanmış ürünleri görmesini sağlar

-- Mevcut policy'yi kaldır ve yeniden oluştur
DROP POLICY IF EXISTS "shop_products_select_public" ON shop_products;

-- Yeni policy: aktif mağazanın onaylanmış ürünleri public görünsün
CREATE POLICY "shop_products_select_public" ON shop_products
    FOR SELECT 
    USING (
        status = 'approved' 
        AND EXISTS (
            SELECT 1 FROM shop_accounts 
            WHERE shop_accounts.id = shop_products.shop_account_id 
            AND shop_accounts.is_active = true
        )
    );

-- Kontrol
SELECT 'RLS policy güncellendi' as status;
