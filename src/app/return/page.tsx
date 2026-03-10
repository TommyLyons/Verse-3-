'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { CheckCircle, ShoppingBag, ArrowRight, RefreshCcw, DownloadCloud, FileImage } from 'lucide-react';
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';

function ReturnContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const { user } = useUser();
  const firestore = useFirestore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [processed, setProcessed] = useState(false);
  const [purchasedDigitalItems, setPurchasedDigitalItems] = useState<any[]>([]);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId && !processed) {
      const digitalItems = cart.filter(item => item.digital);
      setPurchasedDigitalItems(digitalItems);

      // Save to user collection if logged in to build their permanent library
      if (user && firestore && digitalItems.length > 0) {
          digitalItems.forEach(item => {
              const purchaseRef = collection(firestore, 'users', user.uid, 'purchasedProducts');
              
              const trackData = item.tracks ? item.tracks.map((t: any) => ({
                  title: t.title,
                  downloadUrl: t.audioUrl
              })) : [];

              addDocumentNonBlocking(purchaseRef, {
                  productId: String(item.id),
                  productName: item.name,
                  downloadUrl: item.downloadUrl || '',
                  imageUrl: item.imageUrl || '',
                  tracks: trackData,
                  purchasedAt: serverTimestamp(),
              });
          });
      }

      setStatus('success');
      setProcessed(true);
      // Clear the cart after extracting digital items for display
      clearCart();
    } else if (sessionId) {
        setStatus('success');
    } else {
      setStatus('error');
    }
  }, [searchParams, cart, user, firestore, clearCart, processed]);

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
      
      <p className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto mb-10 font-medium">
        Welcome to the family. Your order has been processed successfully. You can download your digital content below.
      </p>

      {purchasedDigitalItems.length > 0 && (
          <div className="w-full max-w-2xl bg-black/5 p-8 border-2 border-black/10 mb-10 space-y-6 rounded-none">
              <div className="text-center space-y-1">
                <p className="font-bold uppercase tracking-widest text-xs text-black">Digital Library Access</p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Authorized Audio Masters & Artwork</p>
              </div>
              
              <div className="space-y-4">
                  {purchasedDigitalItems.map((item, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-black/5 pb-4 last:border-0 last:pb-0">
                          <div className="text-center sm:text-left">
                              <span className="font-headline text-2xl uppercase italic block">{item.name}</span>
                              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{item.brand || 'Verse3 Records'}</span>
                          </div>
                          <div className="flex gap-2 w-full sm:w-auto">
                              {item.downloadUrl && (
                                <Button asChild size="sm" className="flex-1 bg-black text-chart-1 font-bold h-10 rounded-none uppercase italic text-xs hover:bg-black/90">
                                    <a href={item.downloadUrl} download={`${item.name}.mp3`}>
                                        <DownloadCloud className="mr-2 h-4 w-4" />
                                        Audio
                                    </a>
                                </Button>
                              )}
                              {item.imageUrl && (
                                <Button asChild size="sm" variant="outline" className="flex-1 border-2 border-black font-bold h-10 rounded-none uppercase italic text-xs hover:bg-black/5">
                                    <a href={item.imageUrl} download={`${item.name}-Artwork.jpg`}>
                                        <FileImage className="mr-2 h-4 w-4" />
                                        Artwork
                                    </a>
                                </Button>
                              )}
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <Button onClick={() => router.push('/store')} size="lg" className="flex-1 h-16 bg-black text-chart-1 font-headline text-xl uppercase italic rounded-none hover:bg-black/90">
            Keep Shopping
            <ShoppingBag className="ml-2 h-5 w-5" />
        </Button>
        <Button onClick={() => router.push('/profile')} size="lg" variant="outline" className="flex-1 h-16 border-2 border-black font-headline text-xl uppercase italic rounded-none hover:bg-black/5">
            My Library
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