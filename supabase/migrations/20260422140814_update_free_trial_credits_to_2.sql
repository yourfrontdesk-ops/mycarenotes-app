/*
  # Update free trial credits from 1 to 2

  ## Overview
  Updates the new user signup trigger to grant 2 free credits instead of 1,
  giving new users enough to try the service twice before purchasing.

  ## Changes
  - Recreates `handle_new_user_credit` function with `credits = 2`
*/

CREATE OR REPLACE FUNCTION handle_new_user_credit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_credits (user_id, credits)
  VALUES (NEW.id, 2)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;
