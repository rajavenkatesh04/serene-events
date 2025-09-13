// app/lib/data.ts

import { unstable_noStore as noStore } from 'next/cache';
import {User, Event, Invitation, FirestoreTimestamp, Organisation} from '@/app/lib/definitions';
// Switch to using the ADMIN Firestore instance for all server-side data fetching
import { adminDb } from './firebase-server';
import { Timestamp } from 'firebase-admin/firestore';
import { Announcement } from '@/app/lib/definitions';

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

// Fetches the 5 most recent events a user is an admin of
export async function fetchAllEvents(userId: string) {
    noStore();
    try {
        // Use Admin SDK syntax for collection group query
        const eventsSnapshot = await adminDb.collectionGroup('events')
            .where("admins", "array-contains", userId)
            .orderBy('createdAt', 'desc')
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


// Replace the fetchPaginatedEvents function in app/lib/data.ts

const ITEMS_PER_PAGE = 5;

export async function fetchPaginatedEvents(
    userId: string,
    currentPage: number,
    filter: 'all' | 'ownedByMe' | 'adminOf' = 'all'
) {
    try {
        // Base query to get all events a user is an admin of
        const allEventsQuery = adminDb.collectionGroup('events')
            .where('admins', 'array-contains', userId)
            .orderBy('createdAt', 'desc');

        // Get all events to filter and count
        const allEventsSnapshot = await allEventsQuery.get();
        const allEvents = allEventsSnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                ...data,
                docId: doc.id,
                createdAt: serializeTimestamp(data.createdAt),
                startsAt: serializeTimestamp(data.startsAt),
                endsAt: serializeTimestamp(data.endsAt),
            } as Event;
        });

        // Filter events based on the filter parameter
        let filteredEvents: Event[] = [];

        switch (filter) {
            case 'all':
                filteredEvents = allEvents;
                break;
            case 'ownedByMe':
                filteredEvents = allEvents.filter(event => event.ownerUid === userId);
                break;
            case 'adminOf':
                filteredEvents = allEvents.filter(event =>
                    event.admins.includes(userId) && event.ownerUid !== userId
                );
                break;
            default:
                filteredEvents = allEvents;
        }

        // Calculate counts for each filter type
        const counts = {
            all: allEvents.length,
            ownedByMe: allEvents.filter(event => event.ownerUid === userId).length,
            adminOf: allEvents.filter(event =>
                event.admins.includes(userId) && event.ownerUid !== userId
            ).length,
        };

        // Calculate pagination
        const totalCount = filteredEvents.length;
        const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

        // Get events for current page
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

        return {
            events: paginatedEvents,
            totalPages,
            counts
        };

    } catch (error) {
        console.error('Database Error fetching paginated events:', error);
        return {
            events: [],
            totalPages: 0,
            counts: { all: 0, ownedByMe: 0, adminOf: 0 }
        };
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


// A new data fetcher to get events by their IDs
async function fetchEventsByIds(eventIds: string[]): Promise<Event[]> {
    if (!eventIds || eventIds.length === 0) {
        return [];
    }
    // Firestore 'in' queries are limited to 30 items per query.
    // For a larger scale app, you might need to batch these queries.
    const eventQuery = adminDb.collectionGroup('events').where('id', 'in', eventIds);
    const snapshot = await eventQuery.get();
    return snapshot.docs.map(doc => doc.data() as Event);
}

// --- ADD THIS NEW FUNCTION ---
export async function fetchAttendedEvents(userId: string): Promise<Event[]> {
    noStore();
    try {
        const userProfile = await fetchUserProfile(userId);
        const attendedEventIds = userProfile?.attendedEvents || [];

        if (attendedEventIds.length === 0) {
            return [];
        }

        const attendedEvents = await fetchEventsByIds(attendedEventIds);
        return attendedEvents;
    } catch (error) {
        console.error("Database Error fetching attended events:", error);
        return [];
    }
}


// ADD THIS NEW FUNCTION AT THE END OF YOUR data.ts FILE

/**
 * Fetches event data specifically for the public-facing event page (/e/[id]).
 * It does not require user authentication and serializes all timestamps for client components.
 * @param eventId The short, user-facing ID of the event.
 * @returns An object with the serialized event data and its Firestore path, or null if not found.
 */
export async function fetchPublicEventByShortId(eventId: string) {
    noStore();
    try {
        const eventSnapshot = await adminDb.collectionGroup('events').where('id', '==', eventId).limit(1).get();

        if (eventSnapshot.empty) {
            return null;
        }

        const eventDoc = eventSnapshot.docs[0];
        const eventData = eventDoc.data();
        const eventPath = eventDoc.ref.path;

        // Serialize all timestamp fields before returning the data
        const serializedEvent = {
            ...eventData,
            docId: eventDoc.id,
            // This is the critical part: ensure all timestamps are plain objects
            createdAt: serializeTimestamp(eventData.createdAt),
            startsAt: serializeTimestamp(eventData.startsAt),
            endsAt: serializeTimestamp(eventData.endsAt),
        } as Event;

        return { initialEvent: serializedEvent, eventPath };

    } catch (error) {
        console.error('Database Error fetching public event by ID:', error);
        return null;
    }
}





export async function fetchAllAnnouncementsForEvent(eventPath: string): Promise<Announcement[]> {
    noStore();
    try {
        const announcementsSnapshot = await adminDb.collection(`${eventPath}/announcements`).orderBy('createdAt', 'desc').get();

        return announcementsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: serializeTimestamp(data.createdAt),
            } as Announcement;
        });
    } catch (error) {
        console.error('Database Error fetching all announcements:', error);
        return [];
    }
}