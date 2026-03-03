'use server';

import Stripe from 'stripe';
import { headers } from 'next/headers';

// Initialize Stripe with the Secret Key from environment variables
// Note: You must add STRIPE_SECRET_KEY to your .env or Firebase App Hosting secrets
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-01-27.acacia',
});

export async function createCheckoutSession(formData: { cart: any[]; customerDetails: any }) {
  const { cart, customerDetails } = formData;
  const origin = (await headers()).get('origin');

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("STRIPE_SECRET_KEY is missing from environment variables.");
    throw new Error("Payment gateway configuration error.");
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
            name: item.name,
            images: [item.imageUrl].filter(Boolean),
            description: item.description,
          },
          unit_amount: amount,
        },
        quantity: item.quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: 'payment',
      success_url: `${origin}/checkout?success=true`,
      cancel_url: `${origin}/checkout?canceled=true`,
      customer_email: customerDetails.email,
      metadata: {
        customerName: customerDetails.name,
        customerAddress: customerDetails.address,
        customerPhone: customerDetails.phone,
      },
    });

    return { url: session.url };
  } catch (error: any) {
    console.error('Stripe Session Error:', error);
    throw new Error(error.message || 'Failed to create checkout session');
  }
}
