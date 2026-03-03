
'use client';

import React, { useMemo, useState, useEffect, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { getSdks } from '@/firebase/init';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [mounted, setMounted] = useState(false);
  const sdks = useMemo(() => getSdks(), []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // To prevent hydration mismatch, we ensure the initial render on the client
  // matches the server's loading state. We only render the children/provider
  // after the component has mounted on the client.
  if (!mounted || !sdks.firebaseApp || !sdks.auth || !sdks.firestore) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        Initializing Verse3 Services...
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
