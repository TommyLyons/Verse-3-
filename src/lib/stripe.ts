import Stripe from 'stripe';

/**
 * Initializes the Stripe Node.js library using the secret key from environment variables.
 * This key is managed securely via Firebase App Hosting Secrets.
 */
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("STRIPE_SECRET_KEY is missing from environment variables. Checkout will fail until added to App Hosting Secrets.");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-01-27.acacia',
});
