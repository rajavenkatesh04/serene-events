"use server";

import { z } from "zod";
import { auth as adminAuth } from '@/app/lib/firebase-admin';
import { adminDb } from "@/app/lib/firebase-server";
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

// --- Define the shape of the form data ---
const SubmitFeedbackSchema = z.object({
    eventId: z.string().min(1, "Event ID is missing."),
    fullName: z.string().min(2, "Full name is required."),
    email: z.string().email("Please enter a valid email address."),
    registrationId: z.string().optional(),
    comments: z.string().optional(),
    // Allow ratings to be empty strings if not selected
    registrationRating: z.string().optional(),
    communicationRating: z.string().optional(),
    venueRating: z.string().optional(),
    pacingRating: z.string().optional(),
});

// --- Define the state for the useActionState hook ---
export type SubmitFeedbackState = {
    message?: string | null;
    errors?: {
        fullName?: string[];
        email?: string[];
        // Add other fields if you have specific errors for them
    };
    isSuccess?: boolean;
};

// --- The Server Action ---
export async function submitFeedback(prevState: SubmitFeedbackState, formData: FormData): Promise<SubmitFeedbackState> {
    const session = await adminAuth.getSession(); // Get session to see if user is logged in

    const validatedFields = SubmitFeedbackSchema.safeParse(Object.fromEntries(formData));

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Invalid fields. Please check your input.',
        };
    }

    const { eventId, ...feedbackData } = validatedFields.data;

    try {
        // Use a collection group query to find the event document by its short ID
        const eventQuery = adminDb.collectionGroup('events').where('id', '==', eventId).limit(1);
        const eventSnapshot = await eventQuery.get();

        if (eventSnapshot.empty) {
            return { message: "Error: Event not found." };
        }
        const eventDocRef = eventSnapshot.docs[0].ref;

        // Run the entire operation as a transaction
        await adminDb.runTransaction(async (transaction) => {
            const eventDoc = await transaction.get(eventDocRef);
            if (!eventDoc.exists) {
                throw new Error("Event document does not exist.");
            }

            // 1. CREATE THE NEW FEEDBACK DOCUMENT in the subcollection
            const newFeedbackRef = eventDocRef.collection('feedback').doc();
            transaction.set(newFeedbackRef, {
                ...feedbackData,
                submitterUid: session?.uid || null, // Add user's UID if they are logged in
                submittedAt: FieldValue.serverTimestamp(),
            });

            // 2. UPDATE THE SUMMARY OBJECT on the parent event document
            // ✨ FIXED: Replaced 'any' with the correct 'FieldValue' type
            const updatePayload: { [key: string]: FieldValue } = {
                'feedbackSummary.totalResponses': FieldValue.increment(1),
            };

            // Dynamically build the increment payload for each rating provided
            if (feedbackData.registrationRating) {
                updatePayload[`feedbackSummary.registrationRating.${feedbackData.registrationRating}`] = FieldValue.increment(1);
            }
            if (feedbackData.communicationRating) {
                updatePayload[`feedbackSummary.communicationRating.${feedbackData.communicationRating}`] = FieldValue.increment(1);
            }
            if (feedbackData.venueRating) {
                updatePayload[`feedbackSummary.venueRating.${feedbackData.venueRating}`] = FieldValue.increment(1);
            }
            if (feedbackData.pacingRating) {
                updatePayload[`feedbackSummary.pacingRating.${feedbackData.pacingRating}`] = FieldValue.increment(1);
            }

            // Perform the update. Firestore creates the nested objects if they don't exist.
            transaction.update(eventDocRef, updatePayload);
        });

    } catch (error) {
        console.error("Feedback Submission Error:", error);
        return { message: "Database error: Failed to submit feedback." };
    }

    // Revalidate the event page path so users can see updated data if you show it publicly
    revalidatePath(`/e/${eventId}`);

    return { message: "Thank you! Your feedback has been submitted successfully.", isSuccess: true };
}