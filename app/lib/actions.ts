"use server";

import { z } from "zod";
import { nanoid } from 'nanoid';
import {signOut} from 'firebase/auth';
import { auth } from '@/app/lib/firebase';
import { auth as adminAuth } from '@/app/lib/firebase-admin';
import { masterAuth  } from '@/app/lib/firebase-admin';
import { adminDb, adminMessaging, adminStorage } from "@/app/lib/firebase-server"; // Ensure adminStorage is imported
import { Timestamp, FieldValue, DocumentSnapshot  } from 'firebase-admin/firestore';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { Message } from 'firebase-admin/messaging';



// =================================================================================
// --- USER & PROFILE ACTIONS ---
// =================================================================================

export type CompleteProfileState = {
    message?: string;
    errors?: {
        organizationName?: string[];
        server?: string[];
    };
};

const CompleteProfileSchema = z.object({
    organizationName: z.string().min(2, { message: "Organization name must be at least 2 characters." }),
});

export async function completeUserProfile(
    prevState: CompleteProfileState | null,
    formData: FormData
): Promise<CompleteProfileState> {
    const session = await adminAuth.getSession();
    if (!session?.uid || !session.email) {
        return { message: "Authentication error. Please sign in again." };
    }

    const validatedFields = CompleteProfileSchema.safeParse({
        organizationName: formData.get('organizationName'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Invalid organization name.',
        };
    }
    const { organizationName } = validatedFields.data;

    try {
        const userDocRef = adminDb.collection('users').doc(session.uid);
        const userDoc = await userDocRef.get();

        if (userDoc.exists) {
            console.log("User profile already exists, redirecting to dashboard.");
            redirect('/dashboard');
        }

        const batch = adminDb.batch();
        const orgRef = adminDb.collection('organizations').doc();
        batch.set(orgRef, {
            name: organizationName,
            ownerUid: session.uid,
            subscriptionTier: 'free',
        });

        batch.set(userDocRef, {
            uid: session.uid,
            email: session.email,
            displayName: session.name || "User",
            organizationId: orgRef.id,
            role: 'owner',
        });

        await batch.commit();

    } catch (err) {
        console.error("Profile Completion Error:", err);
        return { message: "Failed to create your workspace. Please try again." };
    }

    revalidatePath('/dashboard');
    redirect('/dashboard');
}

// =================================================================================
// --- AUTH ACTIONS ---
// =================================================================================

export async function logout() {
    try {
        await signOut(auth);
        const cookieStore = await cookies();
        cookieStore.set('session', '', { maxAge: -1 });
    } catch (error) {
        console.error('Logout Error:', error);
    }
    redirect('/login');
}

// =================================================================================
// --- EVENT ACTIONS ---
// =================================================================================

export type CreateEventState = {
    errors?: {
        title?: string[];
        description?: string[];
        status?: string[];
        locationText?: string[];
        startsAt?: string[];
        endsAt?: string[];
        logoUrl?: string[];
        bannerUrl?: string[];
    };
    message?: string | null;
};

const CreateEventSchema = z.object({
    title: z.string().min(3, { message: "Title must be at least 3 characters." }),
    description: z.string().optional(),
    locationText: z.string().min(3, { message: "Please provide a clear event location." }),
    // Zod's `coerce.date` will convert the string from the form into a JavaScript Date object
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date(),
    // `url()` validates the input. `optional().or(z.literal(''))` allows the field to be empty.
    logoUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
    bannerUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
});

export async function createEvent(prevState: CreateEventState, formData: FormData): Promise<CreateEventState> {
    const session = await adminAuth.getSession();
    if (!session?.uid) {
        return { message: "Authentication error: Not logged in." };
    }

    const validatedFields = CreateEventSchema.safeParse({
        title: formData.get('title'),
        description: formData.get('description'),
        locationText: formData.get('locationText'),
        startsAt: formData.get('startsAt'),
        endsAt: formData.get('endsAt'),
        logoUrl: formData.get('logoUrl'),
        bannerUrl: formData.get('bannerUrl'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing or invalid fields.',
        };
    }

    const { title, description, locationText, startsAt, endsAt, logoUrl, bannerUrl } = validatedFields.data;

    // Server-side validation for dates
    if (startsAt >= endsAt) {
        return { message: "The event's end time must be after its start time." };
    }

    try {
        const userDoc = await adminDb.doc(`users/${session.uid}`).get();
        if (!userDoc.exists) {
            return { message: "Database error: User profile not found." };
        }

        const organizationId = userDoc.data()!.organizationId;
        const eventId = nanoid(6).toUpperCase();
        const eventRef = adminDb.doc(`organizations/${organizationId}/events/${eventId}`);

        await eventRef.set({
            id: eventId,
            title: title,
            description: description || '',
            ownerUid: session.uid,
            admins: [session.uid],
            createdAt: Timestamp.now(),
            status: 'scheduled',
            startsAt: Timestamp.fromDate(startsAt),
            endsAt: Timestamp.fromDate(endsAt),
            locationText: locationText,
            logoUrl: logoUrl || null,
            bannerUrl: bannerUrl || null,
        });
    } catch (error) {
        console.error("Event Creation Error:", error);
        return { message: "Database error: Failed to create event." };
    }

    revalidatePath('/dashboard/events');
    redirect('/dashboard/events');
}


export type UpdateEventState = CreateEventState;

// --- CHANGE 2: Completely updated the updateEvent function ---
// This function now uses a new, more detailed schema and handles all the new fields,
// including status, dates, and branding URLs.
export async function updateEvent(prevState: UpdateEventState, formData: FormData): Promise<UpdateEventState> {
    const session = await adminAuth.getSession();
    if (!session?.uid) return { message: "Authentication error." };

    const UpdateEventSchema = z.object({
        docId: z.string(), // The form will now pass the unique Firestore document ID
        id: z.string(), // This is the short, user-facing ID
        title: z.string().min(3, { message: "Title must be at least 3 characters." }),
        description: z.string().optional(),
        locationText: z.string().min(3, { message: "Location text is required." }),
        startsAt: z.coerce.date(),
        endsAt: z.coerce.date(),
        status: z.enum(['scheduled', 'live', 'paused', 'ended', 'cancelled']),
        logoUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
        bannerUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
    });

    const validatedFields = UpdateEventSchema.safeParse(Object.fromEntries(formData));

    if (!validatedFields.success) {
        return { errors: validatedFields.error.flatten().fieldErrors, message: 'Missing or invalid fields.' };
    }

    const { docId, id: shortId, ...updateData } = validatedFields.data;

    if (updateData.startsAt >= updateData.endsAt) {
        return { message: "End time must be after start time." };
    }

    try {
        const userDoc = await adminDb.doc(`users/${session.uid}`).get();
        if (!userDoc.exists) throw new Error("User profile not found");
        const organizationId = userDoc.data()!.organizationId;
        const eventRef = adminDb.doc(`organizations/${organizationId}/events/${docId}`);

        const eventDoc = await eventRef.get();
        if (!eventDoc.exists) throw new Error("Event not found.");
        if (!eventDoc.data()!.admins.includes(session.uid)) throw new Error("Permission denied.");

        await eventRef.update({
            title: updateData.title,
            description: updateData.description || '',
            locationText: updateData.locationText,
            status: updateData.status,
            startsAt: Timestamp.fromDate(updateData.startsAt),
            endsAt: Timestamp.fromDate(updateData.endsAt),
            logoUrl: updateData.logoUrl || null,
            bannerUrl: updateData.bannerUrl || null,
        });
    } catch (error: unknown) {
        console.error("Event Update Error:", error);
        return { message: error instanceof Error ? error.message : "Database error." };
    }

    revalidatePath(`/dashboard/events/${shortId}`);
    redirect(`/dashboard/events/${shortId}`);
}

export type DeleteEventState = {
    message?: string;
    errors?: {
        server?: string[];
    };
};


export async function deleteEvent(prevState: DeleteEventState, formData: FormData): Promise<DeleteEventState> {
    const session = await adminAuth.getSession();
    if (!session?.uid) return { message: "Authentication error." };

    const eventId = formData.get('eventId')?.toString();
    if (!eventId) return { message: "Event ID is missing." };

    try {
        const eventDocSnapshot = await adminDb.collectionGroup('events').where('id', '==', eventId).limit(1).get();
        if (eventDocSnapshot.empty) throw new Error("Event not found.");

        const eventDoc = eventDocSnapshot.docs[0];
        const eventData = eventDoc.data();

        if (eventData.ownerUid !== session.uid) {
            return { message: "Permission denied. Only the event owner can delete this event." };
        }

        // Delete associated files from Firebase Storage
        const bucket = adminStorage.bucket();
        if (eventData.logoUrl) {
            try {
                const logoPath = new URL(eventData.logoUrl).pathname.split('/o/')[1].split('?')[0];
                await bucket.file(decodeURIComponent(logoPath)).delete();
            } catch (e) { console.error("Could not delete logo file:", e); }
        }
        if (eventData.bannerUrl) {
            try {
                const bannerPath = new URL(eventData.bannerUrl).pathname.split('/o/')[1].split('?')[0];
                await bucket.file(decodeURIComponent(bannerPath)).delete();
            } catch (e) { console.error("Could not delete banner file:", e); }
        }

        // --- NEW LOGIC START ---
        // Find and delete all invitations associated with this event
        const invitationsRef = adminDb.collection('invitations');
        const invitationsQuery = invitationsRef.where('eventId', '==', eventData.id); // Query by the short event ID
        const invitationsSnapshot = await invitationsQuery.get();

        if (!invitationsSnapshot.empty) {
            const deleteBatch = adminDb.batch();
            invitationsSnapshot.docs.forEach(doc => {
                deleteBatch.delete(doc.ref);
            });
            await deleteBatch.commit();
        }
        // --- NEW LOGIC END ---

        // Recursively delete subcollections
        const eventPath = eventDoc.ref.path;
        await deleteCollection(`${eventPath}/subscribers`, 50);
        await deleteCollection(`${eventPath}/announcements`, 50);

        // Finally, delete the event document itself
        await adminDb.doc(eventPath).delete();

    } catch (error: unknown) {
        console.error('Event Deletion Error:', error);
        return { message: error instanceof Error ? error.message : 'An error occurred.' };
    }

    revalidatePath('/dashboard/events');
    redirect('/dashboard/events');
}


// =================================================================================
// --- ANNOUNCEMENT ACTIONS ---
// =================================================================================

export type CreateAnnouncementState = {
    errors?: { title?: string[]; content?: string[]; };
    message?: string | null;
};

export async function createAnnouncement(prevState: CreateAnnouncementState, formData: FormData): Promise<CreateAnnouncementState> {
    const session = await adminAuth.getSession();
    if (!session?.uid) return { message: "Authentication error." };

    const CreateAnnouncementSchema = z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        eventId: z.string(),
        isPinned: z.preprocess((v) => v === 'on', z.boolean()),
        location: z.string().optional(),
        attachment: z.string().optional(),
    });

    const validatedFields = CreateAnnouncementSchema.safeParse(Object.fromEntries(formData));

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing or invalid fields.',
        };
    }

    const { title: announcementTitle, content, eventId, isPinned, location: locationJson, attachment: attachmentJson } = validatedFields.data;

    let locationData = null;
    if (locationJson) {
        try {
            locationData = JSON.parse(locationJson);
        } catch {
            // Fixed: Removed unused 'e' variable that was causing a warning
            return { message: "Invalid location data format." };
        }
    }

    let attachmentData = null;
    if (attachmentJson) {
        try {
            attachmentData = JSON.parse(attachmentJson);
        } catch {
            // Fixed: Removed unused 'e' variable that was causing a warning
            return { message: "Invalid attachment data format." };
        }
    }

    try {
        const eventDoc = await findEventAndVerifyAdmin(eventId, session.uid);
        const eventData = eventDoc.data()!;
        const announcementRef = eventDoc.ref.collection('announcements').doc();

        await announcementRef.set({
            id: announcementRef.id,
            authorName: session.name || 'Admin',
            authorId: session.uid,
            title: announcementTitle,
            content: content,
            isPinned: isPinned,
            location: locationData,
            attachment: attachmentData,
            createdAt: Timestamp.now(),
        });

        const topic = `event_${eventData.id.replace(/-/g, '_')}`;
        const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
        const messagePayload: Message =  {
            topic: topic,
            data: {
                title: eventData.title || 'Event Update',
                body: announcementTitle,
                url: `${baseUrl}/e/${eventData.id}`
            },
            android: {
                priority: 'high' as const,
            },
            apns: {
                headers: {
                    'apns-push-type': 'alert',
                    'apns-priority': '10',
                },
            },
            webpush: {
                headers: {
                    'Urgency': 'high',
                },
            },
        };
        await adminMessaging.send(messagePayload);

    } catch (error: unknown) {
        console.error("Announcement Creation Error:", error);
        return { message: error instanceof Error ? error.message : "Database error." };
    }

    revalidatePath(`/dashboard/events/${eventId}?tab=announcements`);
    return { message: `Successfully created announcement.` };
}

export async function deleteAnnouncement(formData: FormData) {
    const session = await adminAuth.getSession();
    if (!session?.uid) throw new Error("Not authenticated.");

    const { eventId, announcementId } = z.object({
        eventId: z.string(),
        announcementId: z.string()
    }).parse(Object.fromEntries(formData));

    try {
        const eventDoc = await findEventAndVerifyAdmin(eventId, session.uid);
        const announcementRef = eventDoc.ref.collection('announcements').doc(announcementId);
        const announcementDoc = await announcementRef.get();

        if (!announcementDoc.exists) {
            throw new Error("Announcement not found.");
        }

        // CRITICAL FIX: Properly handle the potentially undefined data
        // TypeScript knows that .data() can return undefined, so we need to check for it
        const announcementData = announcementDoc.data();

        // This is the defensive programming approach - always verify data exists
        // before trying to access its properties
        if (announcementData && announcementData.attachment && announcementData.attachment.path) {
            try {
                await adminStorage.bucket().file(announcementData.attachment.path).delete();
                console.log(`Successfully deleted attachment: ${announcementData.attachment.path}`);
            } catch (storageError) {
                console.error("Failed to delete attachment from Storage:", storageError);
                // Note: We don't throw here because we still want to delete the announcement
                // even if the file deletion fails
            }
        }

        // Delete the announcement document regardless of attachment deletion success
        await announcementRef.delete();

        revalidatePath(`/dashboard/events/${eventId}`);
    } catch (error) {
        console.error("Delete Announcement Error:", error);
        // In a real application, you might want to throw this error or handle it differently
        // depending on your error handling strategy
    }
}

// =================================================================================
// --- INVITATION ACTIONS ---
// =================================================================================

export type SendInviteState = { message: string | null; };

export async function sendInvite(prevState: SendInviteState, formData: FormData): Promise<SendInviteState> {
    const session = await adminAuth.getSession();
    if (!session) return { message: 'Not authenticated.' };

    const validatedFields = z.object({
        eventId: z.string(),
        inviteeEmail: z.string().email()
    }).safeParse(Object.fromEntries(formData));

    if (!validatedFields.success) return { message: 'Invalid fields.' };
    const { eventId, inviteeEmail } = validatedFields.data;

    try {
        const eventDoc = await findEventAndVerifyAdmin(eventId, session.uid);
        const eventSnap = eventDoc.data()!;
        const orgId = eventDoc.ref.parent.parent!.id;

        const usersRef = adminDb.collection('users');
        const userQuery = usersRef.where("email", "==", inviteeEmail).limit(1);
        const userSnapshot = await userQuery.get();
        if (userSnapshot.empty) return { message: `No user with email: ${inviteeEmail}` };

        const inviteeUser = userSnapshot.docs[0].data();
        if (eventSnap.admins.includes(inviteeUser.uid)) {
            return { message: 'This user is already an admin for this event.' };
        }

        const invitesRef = adminDb.collection('invitations');
        const invitesQuery = invitesRef.where("inviteeUid", "==", inviteeUser.uid).where("eventId", "==", eventDoc.id).where("status", "==", "pending").limit(1);
        const existingInviteSnap = await invitesQuery.get();
        if (!existingInviteSnap.empty) {
            return { message: 'An invitation for this user is already pending.' };
        }

        const invitationRef = invitesRef.doc();
        await invitationRef.set({
            id: invitationRef.id,
            inviterUid: session.uid,
            inviteeEmail,
            inviteeUid: inviteeUser.uid,
            organizationId: orgId,
            eventId: eventDoc.id,
            eventTitle: eventSnap.title || 'an event',
            status: 'pending',
            createdAt: Timestamp.now(),
        });

        revalidatePath(`/dashboard/events/${eventId}?tab=admins`);
        return { message: `Invite sent successfully to ${inviteeEmail}.` };
    } catch (error) {
        console.error("Send Invite Error:", error);
        return { message: error instanceof Error ? error.message : 'Failed to send invite.' };
    }
}


export async function acceptInvite(formData: FormData) {
    const session = await adminAuth.getSession();
    if (!session) throw new Error("Not authenticated.");

    const invitationId = formData.get('invitationId')?.toString();
    if (!invitationId) throw new Error("Missing ID.");

    const invitationRef = adminDb.doc(`invitations/${invitationId}`);
    const inviteDoc = await invitationRef.get();
    if (!inviteDoc.exists || inviteDoc.data()?.inviteeUid !== session.uid) {
        throw new Error("Invitation not found or invalid.");
    }

    const { organizationId, eventId } = inviteDoc.data()!;
    const eventRef = adminDb.doc(`organizations/${organizationId}/events/${eventId}`);

    const batch = adminDb.batch();
    batch.update(eventRef, { admins: FieldValue.arrayUnion(session.uid) });
    batch.update(invitationRef, { status: 'accepted' });
    await batch.commit();

    revalidatePath('/dashboard/events', 'layout');
    redirect('/dashboard/events');
}

export async function rejectInvite(formData: FormData) {
    const session = await adminAuth.getSession();
    if (!session) throw new Error("Not authenticated.");

    const invitationId = formData.get('invitationId')?.toString();
    if (!invitationId) throw new Error("Missing ID.");

    const invitationRef = adminDb.doc(`invitations/${invitationId}`);
    const inviteDoc = await invitationRef.get();
    if (!inviteDoc.exists || inviteDoc.data()?.inviteeUid !== session.uid) {
        throw new Error("Invitation not found or invalid.");
    }

    await invitationRef.update({ status: 'rejected' });

    revalidatePath('/dashboard/invitations' , 'layout');
}


export async function revokeInvite(formData: FormData) {
    const session = await adminAuth.getSession();
    if (!session) throw new Error("Not authenticated.");

    const eventId = formData.get('eventId')?.toString();
    const invitationId = formData.get('invitationId')?.toString();
    if (!invitationId || !eventId) throw new Error("Missing required fields.");

    await findEventAndVerifyAdmin(eventId, session.uid);

    await adminDb.doc(`invitations/${invitationId}`).delete();
    revalidatePath(`/dashboard/events/${eventId}?tab=admins`);
}

export async function removeAdmin(formData: FormData) {
    const session = await adminAuth.getSession();
    if (!session) throw new Error("Not authenticated.");

    const eventId = formData.get('eventId')?.toString();
    const adminUidToRemove = formData.get('adminUidToRemove')?.toString();

    if (!eventId || !adminUidToRemove) {
        throw new Error("Missing required fields.");
    }

    try {
        const eventDoc = await findEventAndVerifyAdmin(eventId, session.uid);
        const eventData = eventDoc.data()!;

        if (eventData.ownerUid !== session.uid) {
            throw new Error("Only the event owner can remove admins.");
        }

        if (eventData.ownerUid === adminUidToRemove) {
            throw new Error("The event owner cannot be removed.");
        }

        await eventDoc.ref.update({
            admins: FieldValue.arrayRemove(adminUidToRemove)
        });

        revalidatePath(`/dashboard/events/${eventId}?tab=admins`);

    } catch (error) {
        console.error("Remove Admin Error:", error);
    }
}


// =================================================================================
// --- NOTIFICATION ACTIONS ---
// =================================================================================

export async function subscribeToTopic(token: string, eventId: string) {
    if (!token || !eventId) throw new Error('Missing FCM token or eventId');

    const topic = `event_${eventId.replace(/-/g, '_')}`;
    try {
        await adminMessaging.subscribeToTopic(token, topic);

        const eventsQuery = adminDb.collectionGroup('events').where('id', '==', eventId).limit(1);
        const eventSnapshot = await eventsQuery.get();

        if (!eventSnapshot.empty) {
            const eventDoc = eventSnapshot.docs[0];
            const eventPath = eventDoc.ref.path;
            await adminDb.doc(`${eventPath}/subscribers/${token}`).set({ subscribedAt: Timestamp.now() });
        } else {
            console.error(`Could not find event with short ID ${eventId} to save subscriber token.`);
        }

        return { success: true };
    } catch (error) {
        console.error('Error subscribing to topic:', error);
        return { success: false, error: 'Could not subscribe to topic.' };
    }
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

async function findEventAndVerifyAdmin(eventId: string, userId: string): Promise<DocumentSnapshot> {
    const eventsQuery = adminDb.collectionGroup('events').where('id', '==', eventId).limit(1);
    const eventSnapshot = await eventsQuery.get();

    if (eventSnapshot.empty) {
        throw new Error("Event not found.");
    }

    const eventDoc = eventSnapshot.docs[0];
    const eventData = eventDoc.data();

    if (!eventData.admins.includes(userId)) {
        throw new Error("Permission denied: You are not an admin for this event.");
    }

    return eventDoc;
}


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
// --- USER & PROFILE ACTIONS ---
// =================================================================================



export type UpdateProfileState = {
    errors?: {
        displayName?: string[];
    };
    message?: string | null;
    status: 'idle' | 'success' | 'error';
};

const UpdateProfileSchema = z.object({
    displayName: z.string().min(2, { message: "Name must be at least 2 characters." }),
});

export async function updateUserProfile(
    prevState: UpdateProfileState,
    formData: FormData
): Promise<UpdateProfileState> {
    const session = await adminAuth.getSession();
    if (!session?.uid) {
        return { message: "Authentication error.", status: 'error', errors: {} };
    }

    const validatedFields = UpdateProfileSchema.safeParse({
        displayName: formData.get('displayName'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Invalid display name.',
            status: 'error',
        };
    }
    const { displayName } = validatedFields.data;

    try {
        // Create a batch to update both Auth and Firestore at the same time
        const userDocRef = adminDb.collection('users').doc(session.uid);
        const batch = adminDb.batch();

        // Update Firestore document
        batch.update(userDocRef, { displayName: displayName });

        // This promise updates Firebase Authentication
        const updateUserPromise = masterAuth.updateUser(session.uid, { displayName: displayName });

        // Run both updates
        await Promise.all([batch.commit(), updateUserPromise]);

    } catch (err) {
        console.error("Profile Update Error:", err);
        return { message: "Failed to update your profile. Please try again.", status: 'error', errors: {} };
    }

    // Revalidate paths to ensure data is fresh across the app
    revalidatePath('/dashboard', 'layout');
    return { message: "Profile updated successfully!", status: 'success', errors: {} };
}


export type DeleteAccountState = {
    message?: string;
    status: 'idle' | 'error';
};

export async function deleteSelfAccount(
    prevState: DeleteAccountState,
    formData: FormData
): Promise<DeleteAccountState> {
    const session = await adminAuth.getSession();
    if (!session?.uid) {
        return { message: "Authentication error.", status: 'error' };
    }

    try {
        const userDocRef = adminDb.doc(`users/${session.uid}`);
        const userDoc = await userDocRef.get();

        if (!userDoc.exists) {
            // If the user doc is gone, still try to delete the auth user
            await masterAuth.deleteUser(session.uid);
            console.log(`Auth user ${session.uid} deleted, but Firestore doc was missing.`);
            // Continue to logout logic
        } else {
            const userData = userDoc.data();
            // CRITICAL: Prevent owners from deleting their accounts
            if (userData?.role === 'owner') {
                return { message: "Account deletion failed. Owners must transfer ownership or delete the organization.", status: 'error' };
            }
            // If not an owner, proceed with deletion
            await userDocRef.delete();
            await masterAuth.deleteUser(session.uid);
        }

        // Clear the session cookie
        const cookieStore = await cookies();
        cookieStore.set('session', '', { maxAge: -1 });

    } catch (err) {
        console.error("Self-Delete Account Error:", err);
        return { message: "Failed to delete your account. Please try again.", status: 'error' };
    }

    // Redirect to login page after successful deletion
    redirect('/login');
}


