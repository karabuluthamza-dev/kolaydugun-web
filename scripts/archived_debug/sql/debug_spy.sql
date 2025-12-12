CREATE OR REPLACE FUNCTION debug_inspect_data()
RETURNS TEXT
SECURITY DEFINER
AS $$
DECLARE
    result TEXT := '';
    r RECORD;
BEGIN
    result := result || '--- Latest Messages ---' || E'\n';
    FOR r IN SELECT * FROM messages ORDER BY created_at DESC LIMIT 5 LOOP
        result := result || 'MsgID: ' || r.id || ', ConvID: ' || r.conversation_id || ', Content: ' || substring(r.content, 1, 20) || '..., Sender: ' || r.sender_id || E'\n';
    END LOOP;

    result := result || E'\n' || '--- Related Conversations ---' || E'\n';
    FOR r IN 
        SELECT c.*, v.business_name as v_name, p.full_name as u_name
        FROM conversations c 
        LEFT JOIN vendors v ON v.id = c.vendor_id
        LEFT JOIN profiles p ON p.id = c.user_id
        WHERE c.id IN (SELECT conversation_id FROM messages ORDER BY created_at DESC LIMIT 5)
    LOOP
        result := result || 'ConvID: ' || r.id || ', VendorID: ' || r.vendor_id || ' (' || COALESCE(r.v_name, 'NULL') || '), UserID: ' || r.user_id || ' (' || COALESCE(r.u_name, 'NULL') || ')' || E'\n';
    END LOOP;
    
    result := result || E'\n' || '--- Support Vendor Info ---' || E'\n';
    FOR r IN SELECT * FROM vendors WHERE business_name ILIKE '%KolayDugun Destek%' OR business_name ILIKE '%Support%' LOOP
        result := result || 'VendorID: ' || r.id || ', Name: ' || r.business_name || E'\n';
    END LOOP;

    RETURN result;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION debug_inspect_data TO anon, authenticated, service_role;
