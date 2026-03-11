'use client';

import { getStripeClient } from '@/lib/stripe';

/**
 * Creates a Stripe Checkout Session with Embedded UI mode.
 * Strictly uses STRIPE_SECRET_KEY from environment with robust validation.
 */
export async function fetchClientSecret(cart: any[]) {
  // In a production environment, STRIPE_SECRET_KEY must be set in the Firebase/App Hosting environment.
  const secretKey = (process.env.STRIPE_SECRET_KEY || '').trim();

  // If the key is missing or is a placeholder, we provide a descriptive error.
  if (!secretKey || secretKey.includes('*') || secretKey.length < 10) {
    console.error("CRITICAL ERROR: STRIPE_SECRET_KEY is missing or invalid in environment.");
    throw new Error("Payment gateway configuration error. Please ensure your Stripe Secret Key is correctly set in the environment variables (STRIPE_SECRET_KEY).");
  }

  if (!cart || cart.length === 0) {
    throw new Error("Your cart is empty.");
  }

  const stripe = getStripeClient();

  try {
    const line_items = cart.map((item: any) => {
      const priceStr = item.price.replace(/[^0-9.]/g, '');
      const amount = Math.round(parseFloat(priceStr) * 100);
      const currency = item.price.includes('€') ? 'eur' : 'gbp';

      if (isNaN(amount) || amount <= 0) {
        throw new Error(`Invalid price detected for item: ${item.name}`);
      }

      return {
        price_data: {
          currency,
          product_data: {
            name: item.name + (item.size ? ` (${item.size})` : ''),
            images: item.imageUrl ? [item.imageUrl] : [],
            description: item.description?.substring(0, 250),
            metadata: {
              product_id: String(item.id),
              size: item.size || '',
              type: item.type,
            }
          },
          unit_amount: amount,
        },
        quantity: item.quantity || 1,
      };
    });

    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      line_items,
      mode: 'payment',
      shipping_address_collection: {
        allowed_countries: ['GB', 'IE', 'US', 'CA', 'FR', 'DE', 'ES', 'IT', 'AU', 'NZ'],
      },
      metadata: {
        order_source: 'verse3_v3_production',
      },
      return_url: `${window.location.origin}/return?session_id={CHECKOUT_SESSION_ID}`,
    });

    return session.client_secret;
  } catch (error: any) {
    console.error('Stripe Session Creation Error:', error.message);
    throw new Error(error.message || 'Secure payment session could not be established.');
  }
}
