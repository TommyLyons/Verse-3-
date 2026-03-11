import Stripe from 'stripe';

/**
 * Initializes the Stripe Node.js library.
 * This is a server-side only utility. The Secret Key is never exposed to the client.
 */
export const getStripeClient = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    // We throw a descriptive error if the key is missing. 
    // This function should only be called in a server environment.
    throw new Error('STRIPE_SECRET_KEY is missing from environment variables.');
  }

  return new Stripe(secretKey, {
    apiVersion: '2025-01-27.acacia',
  });
};

// Note: We no longer export a singleton 'stripe' instance at the top level
// to prevent accidental execution/bundling in client-side contexts.
