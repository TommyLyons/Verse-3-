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
  // We use the same layout wrapper but with null props until mounted.
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
