
SELECT 
    column_name, 
    data_type 
FROM 
    information_schema.columns 
WHERE 
    table_name = 'posts';

SELECT 
    conname AS constraint_name, 
    pg_get_constraintdef(c.oid)
FROM 
    pg_constraint c 
JOIN 
    pg_namespace n ON n.oid = c.connamespace 
WHERE 
    conrelid = 'posts'::regclass;
