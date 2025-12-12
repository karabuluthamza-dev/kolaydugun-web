-- Check who owns the support vendor and if the current user (via email match or just listing) is different
SELECT id, business_name, user_id, email FROM vendors WHERE business_name = 'KolayDugun Destek';

-- Also check if there are conversations for this vendor
SELECT count(*) FROM conversations WHERE vendor_id = (SELECT id FROM vendors WHERE business_name = 'KolayDugun Destek');
