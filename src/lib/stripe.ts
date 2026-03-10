import Stripe from 'stripe';

/**
 * Initializes the Stripe Node.js library using the secret key from environment variables.
 * This pulls directly from the .env file in local development or App Hosting secrets in production.
 */
const secretKey = process.env.STRIPE_SECRET_KEY || '';

if (!secretKey) {
  console.warn('WARNING: STRIPE_SECRET_KEY is not defined in the environment variables.');
}

export const stripe = new Stripe(secretKey, {
  apiVersion: '2025-01-27.acacia',
});
