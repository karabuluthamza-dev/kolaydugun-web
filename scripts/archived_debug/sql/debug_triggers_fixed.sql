-- triggers ve policies kontrolleri (düzeltilmiş)
SELECT event_object_table, trigger_name, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'admin_conversations' OR event_object_table = 'admin_messages';

-- RLS policies kontrolü (yazım hatası düzeltildi)
select * from pg_policies where tablename = 'admin_conversations' or tablename = 'admin_messages';

-- Fonksiyon tanımlarında public.users arama
SELECT routine_name, routine_definition
FROM information_schema.routines
WHERE routine_definition LIKE '%public.users%' OR routine_definition LIKE '%"users"%';
