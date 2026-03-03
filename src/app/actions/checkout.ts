
'use server';

import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';

/**
 * Creates a Stripe Checkout Session with Embedded UI mode.
 * This handles "Instant" checkout by collecting shipping info within Stripe.
 */
export async function fetchClientSecret(cart: any[]) {
  const origin = (await headers()).get('origin');

  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe Secret Key is missing from environment variables.");
  }

  try {
    const line_items = cart.map((item: any) => {
      const priceStr = item.price.replace(/[^0-9.]/g, '');
      const amount = Math.round(parseFloat(priceStr) * 100);
      const currency = item.price.includes('£') ? 'gbp' : 'eur';

      return {
        price_data: {
          currency,
          product_data: {
            name: item.name + (item.size ? ` (${item.size})` : ''),
            images: [item.imageUrl].filter(Boolean),
            description: item.description,
          },
          unit_amount: amount,
        },
        quantity: item.quantity,
      };
    });

    if (line_items.length === 0) {
      throw new Error("Cart is empty");
    }

    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      line_items,
      mode: 'payment',
      automatic_payment_methods: {
        enabled: true,
      },
      shipping_address_collection: {
        allowed_countries: ['GB', 'IE', 'US', 'CA', 'FR', 'DE', 'ES', 'IT', 'AU', 'NZ'],
      },
      return_url: `${origin}/return?session_id={CHECKOUT_SESSION_ID}`,
    });

    return session.client_secret;
  } catch (error: any) {
    console.error('Stripe Session Error:', error);
    throw new Error(error.message || 'Failed to create checkout session');
  }
}
