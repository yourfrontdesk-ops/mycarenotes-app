-- Demo protection: records demo usage so the note generator can limit it.
-- Stores only a one-way hash of the visitor's IP address and a timestamp; rows older than 2 days are deleted automatically.
-- Run once in Supabase -> SQL Editor.
CREATE TABLE IF NOT EXISTS public.demo_usage (
  id bigserial PRIMARY KEY,
  visitor text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS demo_usage_created_at_idx ON public.demo_usage (created_at);
CREATE INDEX IF NOT EXISTS demo_usage_visitor_idx ON public.demo_usage (visitor, created_at);
-- No policies: only the note generator (service role) can read or write this table.
ALTER TABLE public.demo_usage ENABLE ROW LEVEL SECURITY;
