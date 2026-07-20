-- Migration: Enable AI Tool Use
-- Created At: 2026-07-20
-- Description: Updates the marketplace_config table to set tool_use to true for global AI features.

UPDATE public.marketplace_config
SET value = '{"global_drawer": true, "tool_use": true, "handoff": true, "analytics": true, "active_provider": "gemini", "available_providers": ["gemini"]}'
WHERE key = 'ai_features';
