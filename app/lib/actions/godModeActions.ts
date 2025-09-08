"use server";

import { auth as adminAuth } from '@/app/lib/firebase-admin';
import { masterAuth  } from '@/app/lib/firebase-admin';
import { adminDb, adminStorage } from "@/app/lib/firebase-server";
import { revalidatePath } from 'next/cache';

// =================================================================================
// --- MASTER ACTIONS ---
// =================================================================================

export type DeleteUserState = {
    message?: string;
};

export async function deleteUsers(prevState: { message?: string }, formData: FormData): Promise<{ message?: string }> {

    const session = await adminAuth.getSession();
    if (!session?.uid) {
        return { message: "Authentication error. You must be logged in." };
    }

    try {
        const performingUserDoc = await adminDb.doc(`users/${session.uid}`).get();
        if (!performingUserDoc.exists || performingUserDoc.data()?.role !== 'god') {
            return { message: "Permission denied. This action requires god-level privileges." };
        }
    } catch (error) {
        console.error("Error verifying god role:", error);
        return { message: "A server error occurred while verifying permissions." };
    }

    const uidsToDelete = formData.getAll('uidsToDelete') as string[];
    if (uidsToDelete.length === 0) {
        return { message: "No users selected for deletion." };
    }

    let deletedCount = 0;
    let errorCount = 0;

    for (const uid of uidsToDelete) {
        // Note: There is no self-deletion check, as there is no session to check against.
        // You can accidentally delete your own account with this action.
        try {
            const userDocToDelete = await adminDb.doc(`users/${uid}`).get();
            if (!userDocToDelete.exists) {
                // If user doc is gone, still try to delete from Auth
                await masterAuth.deleteUser(uid);
                deletedCount++;
                continue;
            }

            const userData = userDocToDelete.data()!;

            // Full cascade delete logic for 'owner' role
            if (userData.role === 'owner' && userData.organizationId) {
                const orgId = userData.organizationId;
                const orgRef = adminDb.doc(`organizations/${orgId}`);
                const eventsSnapshot = await orgRef.collection('events').get();

                for (const eventDoc of eventsSnapshot.docs) {
                    const eventData = eventDoc.data();
                    const eventPath = eventDoc.ref.path;
                    const bucket = adminStorage.bucket();

                    if (eventData.logoUrl) {
                        try {
                            const logoPath = new URL(eventData.logoUrl).pathname.split('/o/')[1].split('?')[0];
                            await bucket.file(decodeURIComponent(logoPath)).delete();
                        } catch (e) { console.error(`Could not delete logo for event ${eventData.id}:`, e); }
                    }
                    if (eventData.bannerUrl) {
                        try {
                            const bannerPath = new URL(eventData.bannerUrl).pathname.split('/o/')[1].split('?')[0];
                            await bucket.file(decodeURIComponent(bannerPath)).delete();
                        } catch (e) { console.error(`Could not delete banner for event ${eventData.id}:`, e); }
                    }

                    const announcementsSnapshot = await eventDoc.ref.collection('announcements').get();
                    for (const announcementDoc of announcementsSnapshot.docs) {
                        const attachment = announcementDoc.data().attachment;
                        if (attachment && attachment.path) {
                            try { await bucket.file(attachment.path).delete(); } catch (e) { console.error(`Could not delete attachment ${attachment.path}:`, e); }
                        }
                    }

                    const invitesSnapshot = await adminDb.collection('invitations').where('eventId', '==', eventData.id).get();
                    if (!invitesSnapshot.empty) {
                        const batch = adminDb.batch();
                        invitesSnapshot.docs.forEach(doc => batch.delete(doc.ref));
                        await batch.commit();
                    }

                    await deleteCollection(`${eventPath}/subscribers`, 50);
                    await deleteCollection(`${eventPath}/announcements`, 50);
                    await eventDoc.ref.delete();
                }
                await orgRef.delete();
            }

            await userDocToDelete.ref.delete();
            await masterAuth.deleteUser(uid);
            deletedCount++;
        } catch (error) {
            console.error(`Failed to completely delete user ${uid}:`, error);
            errorCount++;
        }
    }

    let message = '';
    if (deletedCount > 0) message += `Successfully deleted ${deletedCount} user(s) and all their data. `;
    if (errorCount > 0) message += `Failed to delete ${errorCount} user(s). Check logs for details.`;

    revalidatePath('/dashboard/master');
    return { message };
}




// =================================================================================
// --- HELPER FUNCTIONS ---
// =================================================================================

async function deleteCollection(collectionPath: string, batchSize: number) {
    const collectionRef = adminDb.collection(collectionPath);
    const query = collectionRef.orderBy('__name__').limit(batchSize);

    return new Promise((resolve, reject) => {
        deleteQueryBatch(query, resolve).catch(reject);
    });
}

async function deleteQueryBatch(query: FirebaseFirestore.Query, resolve: (value: unknown) => void) {
    const snapshot = await query.get();

    if (snapshot.size === 0) {
        resolve(0);
        return;
    }

    const batch = adminDb.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();

    process.nextTick(() => {
        deleteQueryBatch(query, resolve);
    });
}