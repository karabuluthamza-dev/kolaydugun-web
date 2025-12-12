-- RLS'i bypass ederek tüm lead'leri göster
SELECT 
    id,
    contact_name,
    contact_email,
    contact_phone,
    event_date,
    status,
    created_at
FROM public.leads
ORDER BY created_at DESC
LIMIT 10;
