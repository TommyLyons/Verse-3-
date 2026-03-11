import Stripe from 'stripe';

/**
 * Initializes the Stripe Node.js library.
 * Build-safe implementation that doesn't throw during module evaluation.
 */
export const getStripeClient = () => {
  const secretKey = (process.env.STRIPE_SECRET_KEY || '').trim();

  // If secret key is missing or is a placeholder during build, return a safe dummy client.
  // The actual server actions will perform a check before critical operations.
  if (!secretKey || secretKey.length < 10 || secretKey.includes('*')) {
    return new Stripe('sk_test_placeholder_for_build_stability', {
      apiVersion: '2025-01-27.acacia',
    });
  }

  return new Stripe(secretKey, {
    apiVersion: '2025-01-27.acacia',
  });
};
