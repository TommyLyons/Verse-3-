import Stripe from 'stripe';

/**
 * Initializes the Stripe Node.js library using the secret key from environment variables.
 * It will look for STRIPE_SECRET_KEY in your .env file or Firebase App Hosting Secrets.
 */
const secretKey = process.env.STRIPE_SECRET_KEY || '';

export const stripe = new Stripe(secretKey, {
  apiVersion: '2025-01-27.acacia',
});
