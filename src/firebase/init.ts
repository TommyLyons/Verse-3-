
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

let firebaseApp: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

function initializeFirebaseClient() {
  if (getApps().length === 0) {
    const firebaseEnvConfig = process.env.FIREBASE_WEBAPP_CONFIG;
    if (firebaseEnvConfig) {
      try {
        const config = typeof firebaseEnvConfig === 'string' ? JSON.parse(firebaseEnvConfig) : firebaseEnvConfig;
        firebaseApp = initializeApp(config);
      } catch (e) {
        firebaseApp = initializeApp(firebaseConfig);
      }
    } else {
      firebaseApp = initializeApp(firebaseConfig);
    }
  } else {
    firebaseApp = getApp();
  }

  auth = getAuth(firebaseApp);
  firestore = getFirestore(firebaseApp);
}

export function getSdks() {
  if (typeof window !== 'undefined') {
    if (!firebaseApp) {
      initializeFirebaseClient();
    }
    return { firebaseApp, auth, firestore };
  }
  return { firebaseApp: null as any, auth: null as any, firestore: null as any };
}
