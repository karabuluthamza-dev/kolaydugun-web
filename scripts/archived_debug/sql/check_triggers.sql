-- Check for triggers on leads table

SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE event_object_table = 'leads'
  AND event_object_schema = 'public';
