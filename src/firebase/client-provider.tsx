'use client';

import React, { type ReactNode, useState, useEffect } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { getSdks } from '@/firebase/init';

/**
 * A client-side wrapper for the FirebaseProvider.
 * Ensures Firebase is initialized safely and prevents hydration mismatches.
 */
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Simple, safe initialization for client SDKs
  const sdks = mounted ? getSdks() : null;

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
