
'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { getSdks } from '@/firebase/init';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const sdks = useMemo(() => getSdks(), []); 

  if (!sdks.firebaseApp || !sdks.auth || !sdks.firestore) {
    return <div className="flex items-center justify-center min-h-screen bg-black text-white">Initializing Verse3 Services...</div>;
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
