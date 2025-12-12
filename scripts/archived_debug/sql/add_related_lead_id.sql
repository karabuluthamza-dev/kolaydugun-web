ALTER TABLE public.user_notifications 
ADD COLUMN IF NOT EXISTS related_lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL;
