import Stripe from 'stripe';

/**
 * Initializes the Stripe Node.js library.
 * We export a getter function to ensure we always have the latest 
 * environment variable state, especially in diverse cloud environments.
 */
export const getStripeClient = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY || '';

  if (!secretKey || secretKey.includes('***')) {
    console.warn('CRITICAL: STRIPE_SECRET_KEY is missing or contains placeholder characters.');
  }

  return new Stripe(secretKey, {
    apiVersion: '2025-01-27.acacia',
  });
};

// Singleton instance for general use, initialized safely
export const stripe = getStripeClient();
