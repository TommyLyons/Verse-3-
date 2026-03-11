'use server';

import { getStripeClient } from '@/lib/stripe';

/**
 * Creates a Stripe Checkout Session.
 * This is a Server Action to securely handle the Secret Key and prevent exposure.
 */
export async function fetchClientSecret(cart: any[], origin: string) {
  const secretKey = (process.env.STRIPE_SECRET_KEY || '').trim();

  if (!secretKey || secretKey.length < 10 || secretKey.includes('*')) {
    throw new Error("Payment configuration error: Stripe Secret Key is missing or invalid in your environment.");
  }

  if (!cart || cart.length === 0) {
    throw new Error("Your cart is empty.");
  }

  // Initialize client INSIDE the function to be build-safe and runtime-ready
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
              printful_id: item.type === 'merch' ? String(item.id) : '',
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
        order_source: 'verse3_records_production',
      },
      return_url: `${origin}/return?session_id={CHECKOUT_SESSION_ID}`,
    });

    return session.client_secret;
  } catch (error: any) {
    console.error('Stripe Session Creation Error:', error.message);
    throw new Error(error.message || 'Secure payment session could not be established.');
  }
}
