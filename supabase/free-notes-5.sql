-- Launch offer: every account gets 5 free notes (no unlimited access).
-- Run once in Supabase -> SQL Editor -> New query -> Run.

-- 1. New sign-ups start with 5 notes
CREATE OR REPLACE FUNCTION public.handle_new_user_credit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_credits (user_id, credits)
  VALUES (NEW.id, 5)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_credit() FROM PUBLIC, anon, authenticated;

-- 2. Nobody is unlimited by default (undoes the earlier "unlimited for everyone" query if it was run)
ALTER TABLE public.user_credits ALTER COLUMN is_unlimited SET DEFAULT false;
UPDATE public.user_credits SET is_unlimited = false;

-- 3. Top up existing accounts to 5
UPDATE public.user_credits SET credits = GREATEST(credits, 5);

-- Afterwards: in Table Editor -> user_credits, tick is_unlimited again for your own demo account.
