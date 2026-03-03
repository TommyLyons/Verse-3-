import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("STRIPE_SECRET_KEY is missing from environment variables. Stripe functionality will be limited until added to App Hosting Secrets.");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-01-27.acacia',
});
