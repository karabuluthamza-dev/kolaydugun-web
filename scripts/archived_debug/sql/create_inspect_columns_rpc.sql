
CREATE OR REPLACE FUNCTION inspect_table_columns(target_table text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_agg(column_name) INTO result 
  FROM information_schema.columns 
  WHERE table_name = target_table;
  
  RETURN result;
END;
$$;
