-- Get the definition of the problematic function
SELECT pg_get_functiondef('handle_new_message_notification'::regproc);
