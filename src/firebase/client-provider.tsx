'use client';

import React, { type ReactNode, useState, useEffect } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { getSdks } from '@/firebase/init';

/**
 * A client-side wrapper for the FirebaseProvider.
 * Ensures Firebase is initialized safely and prevents hydration mismatches.
 */
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [sdks, setSdks] = useState<{ firebaseApp: any, auth: any, firestore: any } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initializedSdks = getSdks();
    setSdks(initializedSdks);
    setMounted(true);
  }, []);

  // Simple loading state to prevent hydration mismatches
  if (!mounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-chart-1 border-t-transparent"></div>
          <p className="font-headline text-xl tracking-widest uppercase italic text-white">Initializing Verse3</p>
        </div>
      </div>
    );
  }

  return (
    <FirebaseProvider
      firebaseApp={sdks?.firebaseApp || null}
      auth={sdks?.auth || null}
      firestore={sdks?.firestore || null}
    >
      {children}
    </FirebaseProvider>
  );
}
