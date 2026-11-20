-- LAUNCH OFFER: give every account unlimited notes (existing and new sign-ups).
-- Run in Supabase -> SQL Editor. Undo with free-access-off.sql.
ALTER TABLE public.user_credits ALTER COLUMN is_unlimited SET DEFAULT true;
UPDATE public.user_credits SET is_unlimited = true;
