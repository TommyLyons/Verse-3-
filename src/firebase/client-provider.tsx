'use client';

import React, { type ReactNode, useState, useEffect } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { getSdks } from '@/firebase/init';

/**
 * A client-side wrapper for the FirebaseProvider.
 * It ensures that the Firebase SDKs are only initialized on the client side
 * to prevent hydration mismatches and server-side rendering errors.
 */
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [sdks, setSdks] = useState<any>(null);

  useEffect(() => {
    // Initializing on the client side only
    const initializedSdks = getSdks();
    setSdks(initializedSdks);
  }, []);

  if (!sdks) {
    // Consistent loading state between server and initial client render
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-chart-1 border-t-transparent"></div>
          <p className="font-headline text-xl tracking-widest uppercase italic animate-pulse">Initializing Verse3 Services...</p>
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
