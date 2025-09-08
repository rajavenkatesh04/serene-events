"use server";

import { auth as adminAuth } from '@/app/lib/firebase-admin';
import { adminDb } from "@/app/lib/firebase-server";
import { FieldValue } from 'firebase-admin/firestore';


export async function joinEventPostLogin(eventId: string) {
    const session = await adminAuth.getSession();
    if (!session?.uid) {
        return { error: "User not authenticated." };
    }

    try {
        const userDocRef = adminDb.collection('users').doc(session.uid);
        // Using `arrayUnion` prevents the same event from being added multiple times
        await userDocRef.update({
            attendedEvents: FieldValue.arrayUnion(eventId)
        });
        return { success: true };
    } catch (error) {
        console.error("Error adding event to user profile:", error);
        return { error: "Could not save event participation." };
    }
}
