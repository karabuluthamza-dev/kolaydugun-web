-- TEST: Disable Trigger to Isolate Issue
DROP TRIGGER IF EXISTS on_quote_received ON public.vendor_leads;
