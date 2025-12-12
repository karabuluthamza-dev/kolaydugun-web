DO $$
DECLARE
    v_user_id UUID;
    v_vendor_id UUID;
    v_lead_id UUID;
    v_conversation_id UUID;
BEGIN
    -- 1. Get an arbitrary user (Admin/Hamza ideally, but any works for the RPC)
    SELECT id INTO v_user_id FROM auth.users LIMIT 1;

    IF v_user_id IS NULL THEN
        RAISE NOTICE 'No users found!';
        RETURN;
    END IF;

    -- 2. Upsert Support Vendor
    INSERT INTO vendors (user_id, business_name, category, city, min_price)
    VALUES (v_user_id, 'KolayDugun Destek', 'Organizasyon', 'Istanbul', 0)
    ON CONFLICT (business_name) DO UPDATE SET business_name = EXCLUDED.business_name -- No-op to get ID
    RETURNING id INTO v_vendor_id;

    -- If existing vendor didn't return ID (because on conflict doesn't return automatically), fetch it
    IF v_vendor_id IS NULL THEN
        SELECT id INTO v_vendor_id FROM vendors WHERE business_name = 'KolayDugun Destek';
    END IF;

    -- 3. Create a Lead (needed for context)
    INSERT INTO leads (vendor_id, user_id, contact_name, status, message)
    VALUES (v_vendor_id, v_user_id, 'Test Kullanıcı', 'pending', 'Sistem Test Mesajı')
    RETURNING id INTO v_lead_id;

    -- 4. Create Conversation
    INSERT INTO conversations (vendor_id, user_id, lead_id)
    VALUES (v_vendor_id, v_user_id, v_lead_id)
    RETURNING id INTO v_conversation_id;

    -- 5. Add Message
    INSERT INTO messages (conversation_id, sender_id, content, is_read)
    VALUES (v_conversation_id, v_user_id, 'Merhaba, bu bir otomatik test mesajıdır. Admin paneli çalışıyor!', false);

END $$;
