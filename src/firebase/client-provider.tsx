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

  useEffect(() => {
    // Only initialize SDKs on the client after mount to prevent hydration errors
    const initializedSdks = getSdks();
    setSdks(initializedSdks);
  }, []);

  // Return standard context with fallback state until SDKs are ready
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
