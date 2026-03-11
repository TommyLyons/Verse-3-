import Stripe from 'stripe';

/**
 * Initializes the Stripe Node.js library defensively.
 * This implementation is safe to call during the build phase.
 */
export const getStripeClient = () => {
  const secretKey = (process.env.STRIPE_SECRET_KEY || '').trim();

  // If secret key is missing or is a placeholder during build/CI, 
  // return a dummy client with a placeholder key to prevent constructor errors.
  const keyToUse = (secretKey && secretKey.length > 5 && !secretKey.includes('*'))
    ? secretKey
    : 'sk_test_51PlaceholderKeyForBuildStabilityOnly';

  try {
    return new Stripe(keyToUse, {
      apiVersion: '2025-01-27.acacia',
    });
  } catch (error) {
    console.warn("Stripe initialization error, using fallback client.");
    return new Stripe('sk_test_51PlaceholderKeyForBuildStabilityOnly', {
      apiVersion: '2025-01-27.acacia',
    });
  }
};
