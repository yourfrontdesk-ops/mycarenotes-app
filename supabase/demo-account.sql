-- Shared demo account: give it a capped allowance (not unlimited).
-- First create the user: Supabase -> Authentication -> Users -> Add user -> Create new user
--   Email: demo@mycarenotes.co.uk   Password: (the VITE_DEMO_PASSWORD value in .env.production)
--   Tick "Auto Confirm User".
-- Then run this in SQL Editor. Run it again any time to top the demo back up.
UPDATE public.user_credits
SET credits = 200, is_unlimited = false, updated_at = now()
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'demo@mycarenotes.co.uk');
