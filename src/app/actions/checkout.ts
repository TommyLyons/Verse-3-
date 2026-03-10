'use server';

import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';

/**
 * Creates a Stripe Checkout Session with Embedded UI mode.
 * Includes precise metadata for automated Printful fulfillment and Digital Delivery.
 */
export async function fetchClientSecret(cart: any[]) {
  const origin = (await headers()).get('origin');
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey || secretKey.startsWith('sk_live_PASTE')) {
    console.error("STRIPE_SECRET_KEY is missing or invalid.");
    throw new Error("Payment gateway is currently in maintenance. Please try again later.");
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
        throw new Error(`Invalid price detected for: ${item.name}`);
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
              printful_id: item.type === 'merch' ? String(item.id) : '',
              size: item.size || '',
              type: item.type,
              digital: item.digital ? 'true' : 'false'
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
        order_source: 'verse3_web_store_automated',
        has_digital: cart.some(i => i.digital) ? 'true' : 'false'
      },
      return_url: `${origin}/return?session_id={CHECKOUT_SESSION_ID}`,
    });

    return session.client_secret;
  } catch (error: any) {
    console.error('Stripe Session Exception:', error);
    throw new Error(error.message || 'Failed to initialize secure checkout session');
  }
}
