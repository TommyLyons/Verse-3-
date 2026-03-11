import Stripe from 'stripe';

/**
 * Initializes the Stripe Node.js library.
 * This is a server-side only utility. The Secret Key is never exposed to the client.
 */
export const getStripeClient = () => {
  // Use trim() to ensure any accidentally pasted whitespace in .env doesn't break initialization
  const secretKey = (process.env.STRIPE_SECRET_KEY || '').trim();

  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is missing from environment variables. Please check your .env configuration.');
  }

  return new Stripe(secretKey, {
    apiVersion: '2025-01-27.acacia',
  });
};

export const stripe = null; // Prevent top-level singleton export that might be bundled on client
