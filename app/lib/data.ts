// app/lib/data.ts

import { unstable_noStore as noStore } from 'next/cache';
import {User, Event, Invitation, FirestoreTimestamp, Organisation} from '@/app/lib/definitions';
// Switch to using the ADMIN Firestore instance for all server-side data fetching
import { adminDb } from './firebase-server';
import { Timestamp } from 'firebase-admin/firestore';

// Helper function to safely serialize Firestore Timestamps
const serializeTimestamp = (timestamp: unknown) => {
    if (timestamp && typeof timestamp === 'object' && timestamp !== null) {
        const ts = timestamp as { _seconds?: number; _nanoseconds?: number };
        if (ts._seconds !== undefined) {
            return {
                seconds: ts._seconds,
                nanoseconds: ts._nanoseconds || 0,
            };
        }
    }
    return timestamp;
};

// Helper function to get the user's organization ID
async function getOrganizationId(userId: string): Promise<string | null> {
    const userDocRef = adminDb.collection('users').doc(userId);
    const userDoc = await userDocRef.get();
    if (!userDoc.exists) {
        console.error("No user document found for UID:", userId);
        return null;
    }
    return userDoc.data()!.organizationId;
}

// Function to fetch the data for the stat cards
export async function fetchCardData(userId: string) {
    noStore();
    try {
        const orgId = await getOrganizationId(userId);
        if (!orgId) return { totalEvents: 0, totalAdmins: 0 };

        // Use Admin SDK syntax
        const eventsSnapshot = await adminDb.collection(`organizations/${orgId}/events`).get();

        const totalEvents = eventsSnapshot.size;
        const adminSets = eventsSnapshot.docs.map(doc => new Set(doc.data().admins));
        const totalAdmins = new Set(adminSets.flatMap(s => Array.from(s))).size;

        return { totalEvents, totalAdmins };
    } catch (error) {
        console.error('Database Error fetching card data:', error);
        return { totalEvents: 0, totalAdmins: 0 };
    }
}

// Fetches the 5 most recent events a user is an admin of
export async function fetchLatestEvents(userId: string) {
    noStore();
    try {
        // Use Admin SDK syntax for collection group query
        const eventsSnapshot = await adminDb.collectionGroup('events')
            .where("admins", "array-contains", userId)
            .orderBy('createdAt', 'desc')
            .limit(5)
            .get();

        const events = eventsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                docId: doc.id,
                createdAt: serializeTimestamp(data.createdAt),
                startsAt: serializeTimestamp(data.startsAt),
                endsAt: serializeTimestamp(data.endsAt),
            } as Event;
        });

        return events;
    } catch (error) {
        console.error('Database Error fetching latest events:', error);
        return [];
    }
}


// Fetches the complete user profile
export async function fetchUserProfile(userId: string) {
    noStore();
    try {
        const userDoc = await adminDb.collection('users').doc(userId).get();
        if (!userDoc.exists) return null;

        const userData = userDoc.data() as User;
        const orgDoc = await adminDb.collection('organizations').doc(userData.organizationId).get();

        // --- UPDATED LOGIC ---
        // This now returns the full organization object from Firestore, ensuring it
        // matches the 'Organisation' interface perfectly.
        const organizationData = orgDoc.exists
            ? { id: orgDoc.id, ...orgDoc.data() } as Organisation
            : {
                id: userData.organizationId,
                name: 'Unknown Workspace',
                ownerUid: '',
                subscriptionTier: 'free',
            } as Organisation;
        // --- END UPDATED LOGIC ---

        return {
            ...userData,
            organization: organizationData, // Return the full, correctly-typed object
        };
    } catch (error) {
        console.error('Database Error fetching user profile:', error);
        return null;
    }
}


// Fetches a single event by its short ID
export async function fetchEventById(userId: string, eventId: string) {
    noStore();
    try {
        const eventSnapshot = await adminDb.collectionGroup('events').where('id', '==', eventId).limit(1).get();

        if (eventSnapshot.empty) return null;

        const eventDoc = eventSnapshot.docs[0];
        const eventData = eventDoc.data() as Event;

        if (!eventData.admins.includes(userId)) {
            console.error(`User ${userId} does not have permission for event ${eventId}.`);
            return null;
        }

        const organizationId = eventDoc.ref.parent.parent!.id;

        // Serialize all timestamp fields before returning
        return {
            ...eventData,
            docId: eventDoc.id,
            organizationId: organizationId,
            createdAt: serializeTimestamp(eventData.createdAt) as string | FirestoreTimestamp,
            startsAt: serializeTimestamp(eventData.startsAt) as FirestoreTimestamp,
            endsAt: serializeTimestamp(eventData.endsAt) as FirestoreTimestamp,
        };
    } catch (error) {
        console.error('Database Error fetching event by ID:', error);
        return null;
    }
}

// Fetches multiple user profiles based on an array of UIDs
export async function fetchUsersByUid(uids: string[]): Promise<User[]> {
    noStore();
    if (!uids || uids.length === 0) return [];
    try {
        const userDocs = await adminDb.collection('users').where('uid', 'in', uids).get();
        return userDocs.docs.map(doc => doc.data() as User);
    } catch (error) {
        console.error('Database Error fetching users by UID:', error);
        return [];
    }
}


// Fetches all invitations for a specific event
// In app/lib/data.ts

export async function fetchEventInvitations(eventId: string): Promise<Invitation[]> {
    noStore();
    try {
        const snapshot = await adminDb.collection('invitations')
            .where("eventId", "==", eventId)
            .orderBy('createdAt', 'desc')
            .get();

        // 3. Ensure the returned object matches the Invitation type
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: data.id,
                inviteeEmail: data.inviteeEmail,
                status: data.status,
                createdAt: data.createdAt.toDate().toISOString(),
            };
        });
    } catch (error) {
        console.error('Database Error fetching event invites:', error);
        return [];
    }
}

// Fetches the subscriber count for an event
export async function fetchSubscriberCount(userId: string, eventId: string) {
    noStore();
    try {
        const eventData = await fetchEventById(userId, eventId);
        if (!eventData || !eventData.organizationId) return 0;

        const subscribersPath = `organizations/${eventData.organizationId}/events/${eventData.docId}/subscribers`;
        const subscribersSnapshot = await adminDb.collection(subscribersPath).get();

        return subscribersSnapshot.size;
    } catch (error) {
        console.error('Database Error fetching subscriber count:', error);
        return 0;
    }
}

// Fetches pending invitations for the logged-in user
export async function fetchPendingInvites(userId: string) {
    noStore();
    try {
        const snapshot = await adminDb.collection('invitations')
            .where("inviteeUid", "==", userId)
            .where("status", "==", "pending")
            .get();

        return snapshot.docs.map(doc => doc.data());
    } catch (error) {
        console.error('Database Error fetching pending invites:', error);
        return [];
    }
}


// Fetches all users in the system for the master dashboard
export async function fetchAllUsers(): Promise<User[]> {
    noStore();
    try {
        const usersSnapshot = await adminDb.collection('users').get();
        if (usersSnapshot.empty) {
            return [];
        }
        return usersSnapshot.docs.map(doc => doc.data() as User);
    } catch (error) {
        console.error('Database Error fetching all users:', error);
        return [];
    }
}
