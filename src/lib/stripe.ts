import Stripe from 'stripe';

/**
 * Initializes the Stripe Node.js library.
 * This is a server-side only utility. The Secret Key is never exposed to the client.
 */
export const getStripeClient = () => {
  const secretKey = (process.env.STRIPE_SECRET_KEY || '').trim();

  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is missing from environment variables. Please check your .env configuration.');
  }

  return new Stripe(secretKey, {
    apiVersion: '2025-01-27.acacia',
  });
};
