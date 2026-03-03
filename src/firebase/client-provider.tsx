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
  // matches the server's empty output. We only render the provider
  // after the component has mounted on the client.
  if (!mounted || !sdks.firebaseApp || !sdks.auth || !sdks.firestore) {
    return null;
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
