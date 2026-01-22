
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
  if (getApps().length === 0) {
    // In a deployed Firebase App Hosting environment, process.env.FIREBASE_WEBAPP_CONFIG is automatically set.
    // We check for this environment variable to determine which config to use.
    const firebaseEnvConfig = process.env.FIREBASE_WEBAPP_CONFIG;
    if (firebaseEnvConfig) {
        try {
            const config = typeof firebaseEnvConfig === 'string' ? JSON.parse(firebaseEnvConfig) : firebaseEnvConfig;
            firebaseApp = initializeApp(config);
        } catch (e) {
            console.error("Failed to parse FIREBASE_WEBAPP_CONFIG or initialize app. Falling back to local config.", e);
            // If parsing fails, fall back to the local config file.
            firebaseApp = initializeApp(firebaseConfig);
        }
    } else {
        // Fallback for local development or other environments where FIREBASE_WEBAPP_CONFIG is not set.
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
