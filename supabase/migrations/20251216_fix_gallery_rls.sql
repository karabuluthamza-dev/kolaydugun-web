-- Fix shop_gallery RLS policy - Remove auth.users dependency
-- This fixes the "permission denied for table users" error

-- Drop existing policies
DROP POLICY IF EXISTS "shop_gallery_owner_all" ON shop_gallery;

-- Recreate owner policy without auth.users dependency
CREATE POLICY "shop_gallery_owner_all" ON shop_gallery
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM shop_accounts 
            WHERE shop_accounts.id = shop_gallery.shop_id 
            AND shop_accounts.user_id = auth.uid()
        )
    );

-- Ensure admin policy exists
DROP POLICY IF EXISTS "shop_gallery_admin_all" ON shop_gallery;
CREATE POLICY "shop_gallery_admin_all" ON shop_gallery
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );
