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
    // Only initialize SDKs on the client after mount
    const initializedSdks = getSdks();
    setSdks(initializedSdks);
    setMounted(true);
  }, []);

  // Return a consistent structure during hydration to avoid mismatches.
  // We wrap the children in FirebaseProvider even before mount but with nulls.
  // This helps avoid the "useState is null" error which can happen if React context is unstable.
  return (
    <FirebaseProvider
      firebaseApp={sdks?.firebaseApp || null}
      auth={sdks?.auth || null}
      firestore={sdks?.firestore || null}
    >
      {mounted ? children : null}
    </FirebaseProvider>
  );
}
