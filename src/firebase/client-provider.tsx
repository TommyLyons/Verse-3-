
'use client';

import React, { type ReactNode, useState, useEffect } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { getSdks } from '@/firebase/init';

/**
 * A client-side wrapper for the FirebaseProvider.
 * Ensures Firebase is initialized safely and prevents hydration mismatches.
 */
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [sdks, setSdks] = useState<any>(null);

  useEffect(() => {
    // Only initialize SDKs on the client after mount
    const initializedSdks = getSdks();
    setSdks(initializedSdks);
  }, []);

  // Use the FirebaseProvider with potentially null SDKs until mounted/initialized
  // This avoids hydration errors where the server vs client initial state differs.
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
