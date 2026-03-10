'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { useCart } from '@/context/cart-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BackButton } from '@/components/ui/back-button';
import { ShieldCheck, Lock, AlertTriangle, CreditCard, RefreshCcw } from 'lucide-react';
import Image from 'next/image';
import { fetchClientSecret } from '@/app/actions/checkout';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';

const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

export default function CheckoutPage() {
  const { cart } = useCart();
  const [error, setError] = useState<string | null>(null);
  
  const total = useMemo(() => {
    return cart.reduce((acc, item) => acc + parseFloat(item.price.replace(/[^0-9.]/g, '')) * item.quantity, 0);
  }, [cart]);

  const currencySymbol = useMemo(() => {
    if (cart.length === 0) return '£';
    return cart[0].price.includes('£') ? '£' : '€';
  }, [cart]);

  const getClientSecret = useCallback(async () => {
    try {
      setError(null);
      const secret = await fetchClientSecret(cart);
      if (!secret) throw new Error("Server failed to provide a checkout secret.");
      return secret;
    } catch (err: any) {
      console.error("Checkout Exception:", err);
      setError(err.message || "Connection timed out. Please try again.");
      return "";
    }
  }, [cart]);

  if (!STRIPE_PUBLISHABLE_KEY) {
    return (
        <div className="container py-24 text-center">
            <Card className="border-destructive bg-destructive/5 max-w-md mx-auto rounded-none">
                <CardContent className="p-12 text-center space-y-4">
                    <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
                    <h2 className="text-2xl font-headline uppercase italic">API Key Missing</h2>
                    <p className="text-muted-foreground">The Stripe Publishable Key must be configured in your environment settings.</p>
                </CardContent>
            </Card>
        </div>
    );
  }

  if (cart.length === 0) {
      return (
          <div className="container py-24 text-center">
              <h1 className="font-headline text-4xl uppercase italic mb-8">Your session has expired</h1>
              <Button asChild className="bg-black text-chart-1 font-bold h-12 px-8 rounded-none">
                <a href="/store">Return to Store</a>
              </Button>
          </div>
      );
  }

  return (
    <div className="container py-12 md:py-24">
      <BackButton />
      <div className="grid lg:grid-cols-[1fr_400px] gap-12 items-start">
        <div className="space-y-8">
            <div className="space-y-2 text-center md:text-left">
                <h1 className="text-4xl md:text-6xl font-headline text-primary uppercase italic tracking-tighter leading-none">SECURE <span className="text-chart-1">CHECKOUT</span></h1>
                <p className="flex items-center justify-center md:justify-start gap-2 font-bold uppercase tracking-widest text-[10px] text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 text-chart-1" />
                    Encrypted PCI-Compliant Processing
                </p>
            </div>

            {error ? (
                <Card className="border-destructive bg-destructive/5 rounded-none">
                    <CardContent className="p-12 text-center space-y-6">
                        <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
                        <div>
                            <h2 className="text-2xl font-headline uppercase italic">Initialization Failed</h2>
                            <p className="text-muted-foreground max-w-sm mx-auto mt-2">{error}</p>
                        </div>
                        <Button onClick={() => window.location.reload()} className="bg-black text-white rounded-none h-12 px-12">
                            <RefreshCcw className="mr-2 h-4 w-4" /> Retry Secure Connection
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Card className="border-none shadow-2xl bg-white overflow-hidden rounded-none border-t-4 border-black">
                    <CardHeader className="bg-black text-white p-6">
                        <div className="flex justify-between items-center">
                            <CardTitle className="font-headline text-2xl italic uppercase tracking-wider text-chart-1">Payment & Shipping</CardTitle>
                            <div className="flex items-center gap-2">
                                <Lock className="h-5 w-5 text-chart-1/50" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="min-h-[650px] bg-secondary/10">
                            <EmbeddedCheckoutProvider
                                stripe={stripePromise}
                                options={{ fetchClientSecret: getClientSecret }}
                            >
                                <EmbeddedCheckout />
                            </EmbeddedCheckoutProvider>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
        
        <div className="space-y-6 lg:sticky lg:top-24 bg-secondary/30 p-6 rounded-none border-2 border-black/5">
            <h2 className="text-2xl font-headline uppercase italic tracking-wider border-b-2 border-black pb-2">Order Summary</h2>
            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {cart.map(item => (
                    <div key={item.cartId} className="flex items-center gap-4 py-3 border-b border-black/5 last:border-0">
                        <div className="relative w-16 h-16 bg-white rounded-none flex-shrink-0 shadow-sm border border-black/5">
                             <Image
                                src={item.imageUrl || ''}
                                alt={item.name}
                                fill
                                className="object-contain p-2"
                                sizes="64px"
                             />
                        </div>
                        <div className="flex-grow min-w-0">
                            <p className="font-bold uppercase text-[10px] truncate leading-tight">{item.name}</p>
                            {item.size && <p className="text-[9px] text-muted-foreground uppercase font-bold mt-0.5">Size: {item.size}</p>}
                            <p className="text-[10px] font-bold mt-1 text-chart-1 bg-black px-1.5 py-0.5 inline-block">{item.price}</p>
                        </div>
                    </div>
                ))}
            </div>
             <div className="mt-6 pt-6 border-t-2 border-black space-y-4">
                <div className="flex justify-between font-headline text-4xl italic uppercase">
                    <span>Total</span>
                    <span className="text-chart-1 bg-black px-2">{currencySymbol}{total.toFixed(2)}</span>
                </div>
                <div className="bg-black/5 p-4 text-[9px] text-center font-bold uppercase tracking-widest space-y-1">
                    <p className="text-muted-foreground">Standard Global Shipping</p>
                    <p className="text-chart-1 font-bold">FREE (INCLUDED)</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
