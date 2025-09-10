"use server";

import { z } from "zod";
import { nanoid } from 'nanoid';
import { auth as adminAuth } from '@/app/lib/firebase-admin';
import { adminDb, adminMessaging, adminStorage } from "@/app/lib/firebase-server";
import { Timestamp, FieldValue, DocumentSnapshot  } from 'firebase-admin/firestore';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Message } from 'firebase-admin/messaging';


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
        const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000';
        const messagePayload: Message =  {
            topic: topic,
            data: {
                title: eventData.title || 'Event Update',
                body: announcementTitle,
                url: `${baseUrl}/e/${eventId}`
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