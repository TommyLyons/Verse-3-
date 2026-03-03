
'use server';

import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';

/**
 * Creates a Stripe Checkout Session with Embedded UI mode.
 * Includes metadata for automated Printful fulfillment.
 */
export async function fetchClientSecret(cart: any[]) {
  const origin = (await headers()).get('origin');

  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey || secretKey === 'sk_live_PASTE_YOUR_SECRET_KEY_HERE') {
    console.error("STRIPE_SECRET_KEY is missing or invalid.");
    throw new Error("Payment system is currently being configured. Please try again in a few minutes.");
  }

  if (!cart || cart.length === 0) {
    throw new Error("Your cart is empty.");
  }

  try {
    const line_items = cart.map((item: any) => {
      const priceStr = item.price.replace(/[^0-9.]/g, '');
      const amount = Math.round(parseFloat(priceStr) * 100);
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
            // Metadata at the line item level for the webhook to read
            metadata: {
              printful_id: item.id, // This is the sync_product_id
              size: item.size || '',
              type: item.type
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
      // Pass general metadata to the session
      metadata: {
        order_source: 'verse3_web_store'
      },
      return_url: `${origin}/return?session_id={CHECKOUT_SESSION_ID}`,
    });

    return session.client_secret;
  } catch (error: any) {
    console.error('Stripe Session Error:', error);
    throw new Error(error.message || 'Failed to create secure checkout session');
  }
}
