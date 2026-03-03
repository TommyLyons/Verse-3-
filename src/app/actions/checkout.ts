
'use server';

import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';

/**
 * Creates a Stripe Checkout Session with Embedded UI mode.
 * This function is called by the client-side EmbeddedCheckoutProvider.
 * Shipping address collection is enabled so the checkout is "instant" and 
 * handles all logistics within the Stripe UI.
 */
export async function fetchClientSecret(cart: any[]) {
  const origin = (await headers()).get('origin');

  // Ensure the Secret Key is available
  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('PASTE_YOUR_SECRET_KEY_HERE')) {
    throw new Error("Stripe Secret Key is missing. Please check your .env file.");
  }

  try {
    // Dynamically create line items from the cart
    const line_items = cart.map((item: any) => {
      // Extract numeric price from string like "£39" or "€75.00"
      const priceStr = item.price.replace(/[^0-9.]/g, '');
      const amount = Math.round(parseFloat(priceStr) * 100);
      
      // Determine currency based on the price symbol in the cart item
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
      // Explicitly enable automatic payment methods (Apple Pay, Google Pay, etc.)
      automatic_payment_methods: {
        enabled: true,
      },
      // Collect shipping address within Stripe to keep the app flow "instant"
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
