import { initializeApp, getApp, getApps, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Explicitly providing the project ID ensures the Admin SDK
// can correctly resolve credentials and metadata.
const firebaseConfig = {
  projectId: "studio-6967403383-a8bb0",
};

let app: App;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}

export const firestore = getFirestore(app);

export function initializeFirebase() {
    return { app, firestore };
}
