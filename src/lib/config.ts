// Turn on when Stripe is set up: add VITE_PAYMENTS_ENABLED=true to .env.production
export const PAYMENTS_ENABLED = import.meta.env.VITE_PAYMENTS_ENABLED === 'true';

export const SUPPORT_EMAIL = 'help@mycarenotes.co.uk';
