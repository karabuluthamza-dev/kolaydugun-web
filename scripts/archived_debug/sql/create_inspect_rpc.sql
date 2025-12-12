
CREATE OR REPLACE FUNCTION inspect_leads_schema()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  SELECT row_to_json(t) INTO result FROM (SELECT * FROM leads LIMIT 1) t;
  RETURN result;
END;
$$;
