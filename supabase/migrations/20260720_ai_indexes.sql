-- Migration: Phase 1 AI Performance Indexes
-- Created At: 2026-07-20
-- Description: Adds optimal indexes to user_id on ai_chat_sessions and session_id on ai_chat_messages, including sorted composite indexes.

-- Standard foreign key lookup indexes
CREATE INDEX IF NOT EXISTS idx_ai_chat_sessions_user_id ON public.ai_chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_session_id ON public.ai_chat_messages(session_id);

-- Composite indexes optimized for listing user sessions and fetching message history ordered by time
CREATE INDEX IF NOT EXISTS idx_ai_chat_sessions_user_id_created_at ON public.ai_chat_sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_session_id_created_at ON public.ai_chat_messages(session_id, created_at ASC);
