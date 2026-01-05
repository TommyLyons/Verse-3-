
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

let firebaseApp: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

// IMPORTANT: This function should only be called on the client.
function initializeFirebaseClient() {
  if (!getApps().length) {
    try {
      // For Firebase App Hosting, environment variables are automatically available.
      firebaseApp = initializeApp();
    } catch (e) {
      if (process.env.NODE_ENV === 'production') {
        console.warn('Automatic Firebase initialization failed. Falling back to firebaseConfig.', e);
      }
      // Fallback for local development or other environments
      firebaseApp = initializeApp(firebaseConfig);
    }
  } else {
    firebaseApp = getApp();
  }

  auth = getAuth(firebaseApp);
  firestore = getFirestore(firebaseApp);
}

// getSdks ensures that Firebase is initialized before returning the SDK instances.
export function getSdks() {
  // This check ensures we only initialize once.
  if (!firebaseApp) {
    initializeFirebaseClient();
  }
  return { firebaseApp, auth, firestore };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
