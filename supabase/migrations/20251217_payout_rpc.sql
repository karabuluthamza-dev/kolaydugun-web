-- Create a secure function to get shop details for payout
-- This runs with SECURITY DEFINER to bypass RLS, ensuring we can read the shop data even if policies would normally hide it.

CREATE OR REPLACE FUNCTION get_shop_paypal_email(lookup_shop_id UUID)
RETURNS TABLE (
  shop_id UUID,
  business_name TEXT,
  paypal_email TEXT,
  owner_email TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id AS shop_id,
    s.business_name::TEXT,
    s.paypal_email::TEXT,
    p.email::TEXT as owner_email
  FROM shop_accounts s
  LEFT JOIN profiles p ON s.user_id = p.id
  WHERE s.id = lookup_shop_id;
END;
$$;
