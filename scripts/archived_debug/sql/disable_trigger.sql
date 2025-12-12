-- Disable the problematic trigger

DROP TRIGGER IF EXISTS trigger_notify_high_value_lead ON public.leads;

-- Verify it's gone
SELECT 
    trigger_name,
    event_manipulation
FROM information_schema.triggers
WHERE event_object_table = 'leads'
  AND event_object_schema = 'public';
