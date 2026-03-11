import Stripe from 'stripe';

/**
 * Initializes the Stripe Node.js library.
 * This is a server-side only utility.
 */
export const getStripeClient = () => {
  const secretKey = (process.env.STRIPE_SECRET_KEY || '').trim();

  // Prevent build-time crashes if key is missing in the build environment
  if (!secretKey) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('STRIPE_SECRET_KEY is missing in production environment.');
    }
    // Return a dummy client for build-time safety if necessary, 
    // but typically this should only be called at runtime.
    return new Stripe('sk_test_dummy', {
      apiVersion: '2025-01-27.acacia',
    });
  }

  return new Stripe(secretKey, {
    apiVersion: '2025-01-27.acacia',
  });
};
