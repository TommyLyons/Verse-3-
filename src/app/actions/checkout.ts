'use server';

import { headers } from 'next/headers';
import { getStripeClient } from '@/lib/stripe';

/**
 * Creates a Stripe Checkout Session with Embedded UI mode.
 * Strictly uses STRIPE_SECRET_KEY from environment with robust validation.
 */
export async function fetchClientSecret(cart: any[]) {
  const headersList = await headers();
  const host = headersList.get('host');
  const proto = headersList.get('x-forwarded-proto') || 'http';
  const origin = headersList.get('origin') || `${proto}://${host}`;
  
  // Ensure the secret key is fresh and trimmed of any accidental spaces
  const secretKey = (process.env.STRIPE_SECRET_KEY || '').trim();

  if (!secretKey || secretKey.includes('*') || secretKey.length < 10) {
    console.error("CRITICAL ERROR: STRIPE_SECRET_KEY is missing or invalid in environment.");
    throw new Error("Payment gateway configuration error. Please ensure your Stripe Secret Key is correctly set in the environment variables.");
  }

  if (!cart || cart.length === 0) {
    throw new Error("Your cart is empty.");
  }

  // fresh client initialization for this request
  const stripe = getStripeClient();

  try {
    const line_items = cart.map((item: any) => {
      // Clean price string (e.g., "£25.00" -> 25.00)
      const priceStr = item.price.replace(/[^0-9.]/g, '');
      const amount = Math.round(parseFloat(priceStr) * 100);
      
      // Auto-detect currency based on price symbol
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
        order_source: 'verse3_v3_production',
        has_digital: cart.some(i => i.digital) ? 'true' : 'false'
      },
      return_url: `${origin}/return?session_id={CHECKOUT_SESSION_ID}`,
    });

    return session.client_secret;
  } catch (error: any) {
    console.error('Stripe Session Creation Error:', error.message);
    throw new Error(error.message || 'Secure payment session could not be established.');
  }
}
