/*
  # Grant free trial credit on signup

  ## Overview
  Automatically gives every new user 1 free credit the moment they register,
  enabling a one-off trial note generation with no manual activation required.

  ## Changes

  ### New function: `handle_new_user_credit`
  - Triggered after a new row is inserted into `auth.users`
  - Inserts a row into `user_credits` with `credits = 1`
  - Uses ON CONFLICT DO NOTHING so it's safe to run on existing rows too

  ### New trigger: `on_auth_user_created_grant_credit`
  - Fires AFTER INSERT on `auth.users`
  - Executes `handle_new_user_credit` for each new user row

  ## Notes
  - Existing users are unaffected (they get no row inserted, avoiding duplicate grant)
  - The `user_credits` RLS policy already allows authenticated users to read their own row
*/

CREATE OR REPLACE FUNCTION handle_new_user_credit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_credits (user_id, credits)
  VALUES (NEW.id, 1)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_grant_credit ON auth.users;

CREATE TRIGGER on_auth_user_created_grant_credit
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_credit();
