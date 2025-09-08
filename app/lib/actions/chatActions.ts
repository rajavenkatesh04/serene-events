"use server";

import { z } from "zod";
import { auth as adminAuth } from '@/app/lib/firebase-admin';
import { adminDb } from "@/app/lib/firebase-server";
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

const SendMessageSchema = z.object({
    text: z.string().min(1, "Message cannot be empty.").max(1000),
    eventId: z.string(),
});

export async function sendMessage(input: { eventId: string; text: string }) {
    const session = await adminAuth.getSession();
    if (!session?.uid || !session.username) {
        throw new Error("Authentication required: User data is incomplete.");
    }

    const validatedFields = SendMessageSchema.safeParse(input);
    if (!validatedFields.success) {
        throw new Error("Invalid message content.");
    }

    const { eventId, text } = validatedFields.data;

    try {
        const chatRef = adminDb.collection('chats').doc(eventId);
        const messagesRef = chatRef.collection('messages');
        const userRef = adminDb.collection('users').doc(session.uid); // Reference to the user's profile

        await adminDb.runTransaction(async (transaction) => {
            const newMessageRef = messagesRef.doc();

            // 1. Create the new message document
            transaction.set(newMessageRef, {
                senderUid: session.uid,
                senderUsername: session.username,
                senderProfilePicUrl: session.picture || null,
                text: text,
                timestamp: FieldValue.serverTimestamp(),
            });

            // 2. Update the parent chat document with the lastMessage preview
            transaction.set(chatRef, {
                id: eventId,
                type: 'event',
                participantUids: FieldValue.arrayUnion(session.uid),
                lastMessage: {
                    text: text,
                    senderUsername: session.username,
                    timestamp: Timestamp.now(),
                }
            }, { merge: true });

            // 3. Add the event to the user's "attendedEvents" list.
            transaction.update(userRef, {
                attendedEvents: FieldValue.arrayUnion(eventId)
            });
        });

    } catch (error) {
        console.error("Error sending message:", error);
        throw new Error("Failed to send message. Please try again.");
    }

    revalidatePath(`/e/${eventId}`);
}

