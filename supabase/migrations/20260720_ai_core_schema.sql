-- Migration: Phase 1 AI Core Schema
-- Created At: 2026-07-20
-- Description: Creates core tables for AI Chat Sessions & Messages, enables RLS, and sets default feature flags.

-- 1. Create AI Chat Sessions Table
CREATE TABLE IF NOT EXISTS public.ai_chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT DEFAULT 'Neue Konversation', -- German as the primary language
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for ai_chat_sessions
ALTER TABLE public.ai_chat_sessions ENABLE ROW LEVEL SECURITY;

-- Policies for ai_chat_sessions
DROP POLICY IF EXISTS "Users can manage own sessions" ON public.ai_chat_sessions;
CREATE POLICY "Users can manage own sessions" ON public.ai_chat_sessions
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 2. Create AI Chat Messages Table
CREATE TABLE IF NOT EXISTS public.ai_chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.ai_chat_sessions(id) ON DELETE CASCADE NOT NULL,
    role TEXT CHECK (role IN ('user', 'assistant', 'system')) NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for ai_chat_messages
ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies for ai_chat_messages
DROP POLICY IF EXISTS "Users can manage own session messages" ON public.ai_chat_messages;
CREATE POLICY "Users can manage own session messages" ON public.ai_chat_messages
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.ai_chat_sessions
            WHERE ai_chat_sessions.id = ai_chat_messages.session_id
            AND ai_chat_sessions.user_id = auth.uid()
        )
    );

-- 3. Insert Default AI Config Settings
INSERT INTO public.marketplace_config (key, value) VALUES
('ai_features', '{"global_drawer": true, "tool_use": false, "handoff": true, "analytics": true, "active_provider": "gemini", "available_providers": ["gemini"]}')
ON CONFLICT (key) DO NOTHING;
