'use server';

import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';

/**
 * Creates a Stripe Checkout Session with Embedded UI mode.
 * Shipping and customer details are handled within the secure Stripe window.
 */
export async function fetchClientSecret(cart: any[]) {
  const origin = (await headers()).get('origin');

  // Ensure the secret key is available from .env or environment
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey || secretKey === 'sk_live_PASTE_YOUR_SECRET_KEY_HERE') {
    console.error("STRIPE_SECRET_KEY is missing or invalid in environment variables.");
    throw new Error("Payment system is currently being configured. Please try again in a few minutes.");
  }

  if (!cart || cart.length === 0) {
    throw new Error("Your cart is empty.");
  }

  try {
    const line_items = cart.map((item: any) => {
      // Clean price string and convert to cents/pence
      const priceStr = item.price.replace(/[^0-9.]/g, '');
      const amount = Math.round(parseFloat(priceStr) * 100);
      
      // Determine currency based on price symbol or regional defaults
      const currency = item.price.includes('£') ? 'gbp' : 'eur';

      if (isNaN(amount) || amount <= 0) {
        throw new Error(`Invalid price for item: ${item.name}`);
      }

      return {
        price_data: {
          currency,
          product_data: {
            name: item.name + (item.size ? ` (${item.size})` : ''),
            images: item.imageUrl ? [item.imageUrl] : [],
            description: item.description?.substring(0, 250),
          },
          unit_amount: amount,
        },
        quantity: item.quantity || 1,
      };
    });

    // We rely on Stripe Dashboard settings for payment methods (Apple Pay, Google Pay, etc.)
    // to avoid API version mismatch errors with automatic_payment_methods.
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      line_items,
      mode: 'payment',
      shipping_address_collection: {
        allowed_countries: ['GB', 'IE', 'US', 'CA', 'FR', 'DE', 'ES', 'IT', 'AU', 'NZ'],
      },
      return_url: `${origin}/return?session_id={CHECKOUT_SESSION_ID}`,
    });

    return session.client_secret;
  } catch (error: any) {
    console.error('Stripe Session Error:', error);
    throw new Error(error.message || 'Failed to create secure checkout session');
  }
}
