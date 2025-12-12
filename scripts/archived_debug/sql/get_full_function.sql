-- Get full function definition
SELECT pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'notify_high_value_lead';
