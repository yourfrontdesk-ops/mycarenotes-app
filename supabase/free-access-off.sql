-- END OF LAUNCH OFFER: go back to credits (each account keeps its remaining credits).
-- Note: this also removes "unlimited" from any accounts you set by hand, so
-- re-tick is_unlimited for your own demo accounts afterwards.
-- Also set FREE_ACCESS = false in src/lib/config.ts.
ALTER TABLE public.user_credits ALTER COLUMN is_unlimited SET DEFAULT false;
UPDATE public.user_credits SET is_unlimited = false;
