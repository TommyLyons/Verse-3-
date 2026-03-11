import Stripe from 'stripe';

/**
 * Initializes the Stripe Node.js library.
 * This is a server-side only utility.
 */
export const getStripeClient = () => {
  // Always fetch the key freshly and trim whitespace
  const secretKey = (process.env.STRIPE_SECRET_KEY || '').trim();

  // If we are in a build environment and the key is missing, don't crash the whole build
  // unless we are actually trying to use the client.
  if (!secretKey) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('STRIPE_SECRET_KEY is missing in production environment.');
    }
    // We throw here because Stripe constructor requires a non-empty string.
    throw new Error('STRIPE_SECRET_KEY is missing. Check your environment configuration.');
  }

  return new Stripe(secretKey, {
    apiVersion: '2025-01-27.acacia',
  });
};
