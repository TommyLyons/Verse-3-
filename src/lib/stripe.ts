import Stripe from 'stripe';

/**
 * Initializes the Stripe Node.js library.
 * Build-safe implementation that doesn't throw during pre-rendering.
 */
export const getStripeClient = () => {
  const secretKey = (process.env.STRIPE_SECRET_KEY || '').trim();

  // If secret key is missing during build, return a dummy client to prevent build crash.
  // The actual server action will check the key again before making a request.
  if (!secretKey || secretKey.length < 10) {
    return new Stripe('sk_test_build_time_placeholder', {
      apiVersion: '2025-01-27.acacia',
    });
  }

  return new Stripe(secretKey, {
    apiVersion: '2025-01-27.acacia',
  });
};
