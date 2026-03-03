'use client';

import React, { type ReactNode, useState, useEffect } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { getSdks } from '@/firebase/init';

/**
 * A client-side wrapper for the FirebaseProvider.
 * It ensures that the Firebase SDKs are only initialized on the client side
 * after the component has mounted to prevent hydration mismatches.
 */
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [sdks, setSdks] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const initializedSdks = getSdks();
    setSdks(initializedSdks);
  }, []);

  // To prevent hydration errors, we render a consistent shell until the client has mounted
  if (!mounted || !sdks) {
    return (
      <div className="relative flex min-h-dvh flex-col bg-background text-foreground">
        <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-chart-1 border-t-transparent"></div>
              <p className="font-headline text-xl tracking-widest uppercase italic animate-pulse">Verse3</p>
            </div>
        </div>
      </div>
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
