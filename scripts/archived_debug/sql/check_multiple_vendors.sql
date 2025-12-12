-- Find owner of Support Vendor and check their total vendor count
WITH support_owner AS (
    SELECT user_id FROM vendors WHERE business_name = 'KolayDugun Destek' LIMIT 1
)
SELECT 
    v.user_id,
    v.business_name,
    v.id
FROM vendors v
WHERE v.user_id = (SELECT user_id FROM support_owner);
