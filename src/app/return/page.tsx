'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { CheckCircle, ShoppingBag, ArrowRight, RefreshCcw } from 'lucide-react';

function ReturnContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      // In a real app, you might want to verify the session status here
      // via another server action, but for now we'll assume success if we got here.
      setStatus('success');
      clearCart();
    } else {
      setStatus('error');
    }
  }, [searchParams, clearCart]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RefreshCcw className="h-12 w-12 animate-spin text-chart-1" />
        <p className="font-headline text-2xl uppercase italic tracking-widest">Processing Order...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
        <div className="h-16 w-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center">
            <ShoppingBag className="h-8 w-8" />
        </div>
        <h1 className="font-headline text-4xl uppercase italic">Order Not Found</h1>
        <p className="text-muted-foreground max-w-md">We couldn't verify your session. Please contact support if you believe this is an error.</p>
        <Button onClick={() => router.push('/store')} className="bg-black text-chart-1 font-bold">
            Return to Store
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-chart-1 blur-[60px] opacity-20 rounded-full animate-pulse"></div>
        <CheckCircle className="relative h-20 w-20 text-chart-1" />
      </div>
      
      <h1 className="font-headline text-5xl md:text-7xl font-bold uppercase italic tracking-tighter mb-4">
        ORDER <span className="text-chart-1">CONFIRMED</span>
      </h1>
      
      <p className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto mb-10">
        Welcome to the family. Your gear is being prepared and a confirmation email is on its way.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <Button onClick={() => router.push('/store')} size="lg" className="flex-1 h-16 bg-black text-chart-1 font-headline text-xl uppercase italic rounded-none hover:bg-black/90">
            Keep Shopping
            <ShoppingBag className="ml-2 h-5 w-5" />
        </Button>
        <Button onClick={() => router.push('/profile')} size="lg" variant="outline" className="flex-1 h-16 border-2 border-black font-headline text-xl uppercase italic rounded-none hover:bg-black/5">
            View Order
            <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

export default function ReturnPage() {
  return (
    <div className="container py-12 md:py-24">
      <Suspense fallback={<div className="text-center py-20 font-headline text-2xl animate-pulse">Verifying Order...</div>}>
        <ReturnContent />
      </Suspense>
    </div>
  );
}
