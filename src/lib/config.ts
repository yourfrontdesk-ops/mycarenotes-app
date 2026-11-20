// Turn on when Stripe is set up: add VITE_PAYMENTS_ENABLED=true to .env.production
export const PAYMENTS_ENABLED = import.meta.env.VITE_PAYMENTS_ENABLED === 'true';

// Launch offer: free notes per account (the server-side number is set in supabase/free-notes-5.sql)
export const FREE_NOTES = 5;

export const SUPPORT_EMAIL = 'hello@mycarenotes.co.uk';
