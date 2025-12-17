-- Fix missing shop for commission payout debugging
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM shop_accounts WHERE id = 'ce430822-256f-4212-98fd-35d91bd17bf1') THEN
        INSERT INTO shop_accounts (id, user_id, business_name, slug, email, status, created_at)
        VALUES (
            'ce430822-256f-4212-98fd-35d91bd17bf1',
            '00000000-0000-0000-0000-000000000000', -- Dummy User ID
            'DJ34 Istanbul Wedding & Events (Restored)',
            'dj34-restored-' || floor(random() * 1000)::text,
            'restored_shop@example.com',
            'approved',
            NOW()
        );
        RAISE NOTICE 'Restored missing shop account ce43...';
    ELSE
        RAISE NOTICE 'Shop account ce43... already exists.';
    END IF;
END $$;
