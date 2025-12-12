
CREATE TABLE IF NOT EXISTS public.debug_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    function_name TEXT NOT NULL,
    message TEXT NOT NULL,
    payload JSONB,
    created_at TIMESTAMP DEFAULT now()
);

ALTER TABLE public.debug_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public can insert debug logs" ON public.debug_logs
    FOR INSERT WITH CHECK (true);

CREATE POLICY "public can select debug logs" ON public.debug_logs
    FOR SELECT USING (true);
