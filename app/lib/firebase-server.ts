import admin from 'firebase-admin';
import { getMessaging } from 'firebase-admin/messaging';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

export function initFirebaseAdminApp(): admin.app.App {
    if (admin.apps.length > 0) {
        return admin.apps[0] as admin.app.App;
    }
    const serviceAccount = {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };
    const app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        // 2. Add the storage bucket URL to the config
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
    return app;
}

const adminApp = initFirebaseAdminApp();

// Export all the admin services we need
export const adminMessaging = getMessaging(adminApp);
export const adminDb = getFirestore(adminApp);
export const adminStorage = getStorage(adminApp); // 3. Initialize and export adminStorage
