-- Manually insert a test lead to verify everything works

INSERT INTO public.leads (
    contact_name,
    contact_email,
    contact_phone,
    event_date,
    additional_notes,
    budget_min,
    budget_max,
    category_id,
    city_id,
    status,
    user_id,
    created_at
) VALUES (
    'Manual SQL Test',
    'sqltest@example.com',
    '0555 888 7777',
    '2027-03-01',
    'Manually inserted via SQL to test',
    1000,
    5000,
    1, -- Replace with valid category_id
    1, -- Replace with valid city_id
    'new',
    NULL,
    NOW()
);

-- Verify it was created
SELECT 
    id,
    contact_name,
    contact_email,
    status,
    created_at
FROM public.leads
ORDER BY created_at DESC
LIMIT 5;
