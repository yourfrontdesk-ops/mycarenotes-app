// Turn on when Stripe is set up: add VITE_PAYMENTS_ENABLED=true to .env.production
export const PAYMENTS_ENABLED = import.meta.env.VITE_PAYMENTS_ENABLED === 'true';

// Launch offer: everyone gets unlimited notes. Hides credit counts and plans in the app.
// The server-side switch is supabase/free-access-on.sql (run it in the Supabase SQL Editor).
export const FREE_ACCESS = true;

export const SUPPORT_EMAIL = 'help@mycarenotes.co.uk';
