// Turn on when Stripe is set up: add VITE_PAYMENTS_ENABLED=true to .env.production
export const PAYMENTS_ENABLED = import.meta.env.VITE_PAYMENTS_ENABLED === 'true';

// Launch offer: free notes per account (the server-side number is set in supabase/free-notes-5.sql)
export const FREE_NOTES = 5;

// Shared demo account behind the "Try the demo" button. Hidden if not configured.
export const DEMO_EMAIL = (import.meta.env.VITE_DEMO_EMAIL as string | undefined) ?? '';
export const DEMO_PASSWORD = (import.meta.env.VITE_DEMO_PASSWORD as string | undefined) ?? '';
export const DEMO_ENABLED = Boolean(DEMO_EMAIL && DEMO_PASSWORD);

export const SUPPORT_EMAIL = 'hello@mycarenotes.co.uk';
