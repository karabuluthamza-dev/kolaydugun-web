-- Check triggers on admin_conversations
SELECT event_object_table, trigger_name, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'admin_conversations' OR event_object_table = 'admin_messages';

-- Check RLS policies on admin_conversations
select * from pg_policies wheretablename = 'admin_conversations' or tablename = 'admin_messages';

-- Check for any functions that might be using users table
SELECT routine_name, routine_definition
FROM information_schema.routines
WHERE routine_definition LIKE '%public.users%' OR routine_definition LIKE '%"users"%';
