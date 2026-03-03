'use client';

import React, { type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { getSdks } from '@/firebase/init';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  // getSdks returns initialized SDKs on the client, and null placeholders on the server.
  // This ensures the FirebaseProvider is always present in the component tree,
  // preventing "useFirebaseContext must be used within a FirebaseProvider" errors during SSR.
  const sdks = getSdks();

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
