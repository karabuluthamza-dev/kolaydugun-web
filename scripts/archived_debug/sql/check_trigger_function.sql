-- Check the notify_high_value_lead function

SELECT 
    proname as function_name,
    prosrc as function_source
FROM pg_proc
WHERE proname = 'notify_high_value_lead';
