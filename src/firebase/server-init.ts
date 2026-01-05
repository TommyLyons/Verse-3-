
import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// This is a separate initialization for server-side usage.
// It uses firebase-admin to bypass security rules for data fetching.

const firebaseConfig = {
  // Your admin config might be different, often includes service account credentials
  // For many hosting environments (like Cloud Run, Cloud Functions), this can be empty
  // as credentials are automatically discovered.
};

let app: FirebaseApp;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}

export const firestore = getFirestore(app);

export function initializeFirebase() {
    // This function now just returns the initialized services for server-side use.
    return { app, firestore };
}
