'use client';

import React, { type ReactNode, useState, useEffect } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { getSdks } from '@/firebase/init';

/**
 * A client-side wrapper for the FirebaseProvider.
 * Ensures Firebase is initialized only once on the client and prevents hydration mismatches.
 */
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [sdks, setSdks] = useState<{ firebaseApp: any, auth: any, firestore: any } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Initialize SDKs on the client side only
    const initializedSdks = getSdks();
    setSdks(initializedSdks);
  }, []);

  // During SSR or until client has mounted, we render a consistent shell
  // but we still wrap it in FirebaseProvider with null values so hooks don't throw
  if (!mounted || !sdks) {
    return (
      <FirebaseProvider firebaseApp={null} auth={null} firestore={null}>
        <div className="relative flex min-h-dvh flex-col bg-background text-foreground">
          <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-chart-1 border-t-transparent"></div>
                <p className="font-headline text-xl tracking-widest uppercase italic animate-pulse">Initializing Services</p>
              </div>
          </div>
        </div>
      </FirebaseProvider>
    );
  }

  return (
    <FirebaseProvider
      firebaseApp={sdks.firebaseApp}
      auth={sdks.auth}
      firestore={sdks.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
