-- Check if 'KolayDugun Destek' vendor exists and get its ID
WITH support_vendor AS (
    SELECT id, business_name, user_id FROM vendors WHERE business_name = 'KolayDugun Destek'
)
SELECT 
    v.business_name,
    v.id as vendor_id,
    v.user_id as vendor_user_id,
    c.id as conversation_id,
    c.lead_id,
    c.user_id as conversation_user_id,
    m.content as last_message_preview
FROM support_vendor v
LEFT JOIN conversations c ON c.vendor_id = v.id
LEFT JOIN messages m ON m.conversation_id = c.id
ORDER BY c.created_at DESC;
