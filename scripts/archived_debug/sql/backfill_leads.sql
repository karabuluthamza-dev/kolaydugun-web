DO $$
DECLARE
    r RECORD;
    v_lead_id UUID;
    v_contact_name TEXT;
    v_user_email TEXT;
BEGIN
    FOR r IN 
        SELECT c.id, c.user_id, c.vendor_id
        FROM conversations c
        WHERE c.lead_id IS NULL 
        AND exists (select 1 from vendors v where v.id = c.vendor_id and v.business_name = 'KolayDugun Destek')
    LOOP
        -- Try to get email or name (mocking since we can't access auth.users easily in valid SQL blocks on supabase sometimes)
        -- We will just use 'Destek Talebi' + user_id segment as fallback
        v_contact_name := 'Destek Kullanıcısı';

        INSERT INTO leads (vendor_id, user_id, contact_name, status, message)
        VALUES (r.vendor_id, r.user_id, v_contact_name, 'pending', 'Otomatik oluşturulan destek talebi')
        RETURNING id INTO v_lead_id;

        UPDATE conversations
        SET lead_id = v_lead_id
        WHERE id = r.id;
        
    END LOOP;
END $$;
