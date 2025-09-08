"use server";

import { z } from "zod";
import { auth as adminAuth } from '@/app/lib/firebase-admin';
import { adminDb } from "@/app/lib/firebase-server";
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

// Schema to validate the incoming message data
const SendMessageSchema = z.object({
    text: z.string().min(1, "Message cannot be empty.").max(1000, "Message is too long."),
    eventId: z.string(),
});

export async function sendMessage(input: { eventId: string; text: string }) {
    // 1. Get the user's session. The custom claims (username, role) are now included here automatically.
    const session = await adminAuth.getSession();

    // 2. Perform a robust check. We need the UID and username from the session to proceed.
    if (!session?.uid || !session.username) {
        throw new Error("Authentication required: User data is incomplete.");
    }

    // 3. Validate the message text and event ID.
    const validatedFields = SendMessageSchema.safeParse(input);
    if (!validatedFields.success) {
        throw new Error("Invalid message content.");
    }

    const { eventId, text } = validatedFields.data;

    try {
        const chatRef = adminDb.collection('chats').doc(eventId);
        const messagesRef = chatRef.collection('messages');

        // 4. Use a transaction to safely write the new message and update the chat preview.
        await adminDb.runTransaction(async (transaction) => {
            // Create a new document for the message in the sub-collection.
            const newMessageRef = messagesRef.doc();
            transaction.set(newMessageRef, {
                senderUid: session.uid,
                senderUsername: session.username, // ✨ Get username directly from the session
                senderProfilePicUrl: session.picture || null, // Get profile pic from the session
                text: text,
                timestamp: FieldValue.serverTimestamp(), // Let Firestore's servers set the exact time
            });

            // Update the parent chat document with a preview of the last message.
            // Using `set` with `merge: true` will create the chat document if it's the very first message.
            transaction.set(chatRef, {
                id: eventId,
                type: 'event',
                participantUids: FieldValue.arrayUnion(session.uid), // Adds the user to the list of participants
                lastMessage: {
                    text: text,
                    senderUsername: session.username,
                    timestamp: Timestamp.now(),
                }
            }, { merge: true });
        });

    } catch (error) {
        console.error("Error sending message:", error);
        throw new Error("Failed to send message. Please try again.");
    }

    // Tell Next.js to revalidate the path. This isn't critical for the real-time chat
    // but is good practice for data consistency.
    revalidatePath(`/e/${eventId}`);
}