
'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { getSdks } from '@/firebase';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  // Initialize Firebase on the client side, once per application lifecycle.
  const { firebaseApp, auth, firestore } = useMemo(() => getSdks(), []); 

  // If services are not yet available, we can show a loading state or return null,
  // but for this implementation, we will assume they initialize synchronously.
  // A more robust solution might handle a brief period where they are null.
  if (!firebaseApp || !auth || !firestore) {
    // This can be a loading spinner or some fallback UI.
    return <div>Loading Firebase...</div>;
  }

  return (
    <FirebaseProvider
      firebaseApp={firebaseApp}
      auth={auth}
      firestore={firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
