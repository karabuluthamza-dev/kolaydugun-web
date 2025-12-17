-- Auto-deactivate expired shop accounts
-- This function should be called daily via pg_cron or manually

-- Function to deactivate expired shops
CREATE OR REPLACE FUNCTION deactivate_expired_shops()
RETURNS TABLE (
    shop_id UUID,
    business_name TEXT,
    email TEXT,
    expired_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    UPDATE shop_accounts
    SET is_active = false
    WHERE is_active = true
      AND plan_expires_at IS NOT NULL
      AND plan_expires_at < NOW()
    RETURNING id, business_name, email, plan_expires_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION deactivate_expired_shops() TO authenticated;
GRANT EXECUTE ON FUNCTION deactivate_expired_shops() TO service_role;

-- Optional: Create a view to see expiring shops (for admin notifications)
CREATE OR REPLACE VIEW expiring_shops AS
SELECT 
    id,
    business_name,
    email,
    plan,
    plan_expires_at,
    CASE 
        WHEN plan_expires_at < NOW() THEN 'expired'
        WHEN plan_expires_at < NOW() + INTERVAL '7 days' THEN 'expiring_soon'
        ELSE 'active'
    END as expiry_status,
    EXTRACT(DAY FROM plan_expires_at - NOW())::INTEGER as days_remaining
FROM shop_accounts
WHERE is_active = true
  AND plan_expires_at IS NOT NULL
ORDER BY plan_expires_at ASC;

-- Comment explaining usage:
-- To manually run: SELECT * FROM deactivate_expired_shops();
-- To set up daily cron (requires pg_cron extension):
-- SELECT cron.schedule('deactivate-expired-shops', '0 2 * * *', 'SELECT deactivate_expired_shops();');
