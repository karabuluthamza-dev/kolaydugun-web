-- Leads tablosunun detaylı yapısını kontrol et

-- 1. Tüm kolonları ve tiplerini göster
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    udt_name
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'leads'
ORDER BY ordinal_position;

-- 2. Eğer status kolonu enum ise, değerlerini göster
SELECT 
    t.typname,
    e.enumlabel
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname LIKE '%lead%' OR t.typname LIKE '%status%'
ORDER BY t.typname, e.enumsortorder;

-- 3. Leads tablosundaki constraint'leri göster
SELECT
    con.conname AS constraint_name,
    con.contype AS constraint_type,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE nsp.nspname = 'public'
  AND rel.relname = 'leads';

-- 4. Test: Basit bir lead ekle
INSERT INTO public.leads (
    contact_name,
    contact_email,
    status
) VALUES (
    'Test Lead',
    'test@example.com',
    'new'
) RETURNING *;
