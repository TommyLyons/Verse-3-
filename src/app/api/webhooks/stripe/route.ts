import { NextRequest, NextResponse } from 'next/server';
import { getStripeClient } from '@/lib/stripe';
import { getPrintfulApiKey } from '@/ai/flows/get-products-flow';

export const dynamic = 'force-dynamic';

/**
 * Stripe Webhook Handler
 * Automates the creation of Printful orders upon successful payment.
 */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  const stripe = getStripeClient();

  let event;

  try {
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is missing');
      return NextResponse.json({ error: 'Config error' }, { status: 500 });
    }
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;

    try {
      const expandedSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['line_items.data.price.product'],
      });
      await processPrintfulOrder(expandedSession);
    } catch (error) {
      console.error('Failed to automate Printful order fulfillment:', error);
    }
  }

  return NextResponse.json({ received: true });
}

async function processPrintfulOrder(session: any) {
  const apiKey = await getPrintfulApiKey();
  if (!apiKey) throw new Error('Printful API Key missing or unauthorized');

  const shipping = session.shipping_details;
  if (!shipping) throw new Error('No shipping details found in checkout session');

  const lineItems = session.line_items.data;
  const printfulItems = [];

  for (const item of lineItems) {
    const productData = item.price.product;
    const metadata = productData.metadata;

    if (metadata.type === 'merch' && metadata.printful_id) {
      const variantsResponse = await fetch(`https://api.printful.com/sync/products/${metadata.printful_id}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });

      if (variantsResponse.ok) {
        const data = await variantsResponse.json();
        const variants = data.result.sync_variants;
        
        const matchingVariant = variants.find((v: any) => 
          v.size?.toUpperCase() === metadata.size?.toUpperCase() || variants.length === 1
        );

        if (matchingVariant) {
          printfulItems.push({
            sync_variant_id: matchingVariant.id,
            quantity: item.quantity,
          });
        }
      }
    }
  }

  if (printfulItems.length === 0) return;

  const orderPayload = {
    recipient: {
      name: shipping.name,
      address1: shipping.address.line1,
      address2: shipping.address.line2 || '',
      city: shipping.address.city,
      state_code: shipping.address.state || '',
      country_code: shipping.address.country,
      zip: shipping.address.postal_code,
      email: session.customer_details?.email,
      phone: session.customer_details?.phone || ''
    },
    items: printfulItems,
    retail_costs: {
        currency: session.currency.toUpperCase(),
        subtotal: (session.amount_total / 100).toFixed(2),
        shipping: "0.00",
        total: (session.amount_total / 100).toFixed(2)
    }
  };

  const response = await fetch('https://api.printful.com/orders?confirm=1', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderPayload)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Printful Automation Failed: ${JSON.stringify(errorData)}`);
  }
}
