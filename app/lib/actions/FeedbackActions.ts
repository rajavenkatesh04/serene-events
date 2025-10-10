'use server';

import { z } from 'zod';
import { auth as adminAuth } from '@/app/lib/firebase-admin';
import { adminDb } from '@/app/lib/firebase-server';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

// --- Define the shape of the form data ---
const SubmitFeedbackSchema = z.object({
    eventId: z.string().min(1, 'Event ID is missing.'),
    fullName: z.string().min(2, 'Full name is required.'),
    email: z.string().email('Please enter a valid email address.'),
    // ✨ CHANGED: Registration ID is now optional.
    registrationId: z.string().optional(),
    comments: z.string().min(1, 'Comments and suggestions are required.'),
    registrationRating: z.string().min(1, 'Please rate the registration process.'),
    communicationRating: z.string().min(1, 'Please rate the pre-event communication.'),
    venueRating: z.string().min(1, 'Please rate the venue and seating.'),
    pacingRating: z.string().min(1, "Please rate the event's pacing."),
});

// --- Define the state for the useActionState hook ---
// ✨ CHANGED: Removed registrationId from the possible errors.
export type SubmitFeedbackState = {
    message?: string | null;
    errors?: {
        fullName?: string[];
        email?: string[];
        comments?: string[];
        registrationRating?: string[];
        communicationRating?: string[];
        venueRating?: string[];
        pacingRating?: string[];
    };
    isSuccess?: boolean;
};

// --- The Server Action (No logic changes needed here) ---
export async function submitFeedback(
    prevState: SubmitFeedbackState,
    formData: FormData,
): Promise<SubmitFeedbackState> {
    const session = await adminAuth.getSession();

    const validatedFields = SubmitFeedbackSchema.safeParse(Object.fromEntries(formData));

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Invalid fields. Please check your input.',
        };
    }

    const { eventId, ...feedbackData } = validatedFields.data;

    try {
        const eventQuery = adminDb.collectionGroup('events').where('id', '==', eventId).limit(1);
        const eventSnapshot = await eventQuery.get();

        if (eventSnapshot.empty) {
            return { message: 'Error: Event not found.' };
        }
        const eventDocRef = eventSnapshot.docs[0].ref;

        await adminDb.runTransaction(async (transaction) => {
            const eventDoc = await transaction.get(eventDocRef);
            if (!eventDoc.exists) {
                throw new Error('Event document does not exist.');
            }

            const newFeedbackRef = eventDocRef.collection('feedback').doc();
            transaction.set(newFeedbackRef, {
                ...feedbackData,
                submitterUid: session?.uid || null,
                submittedAt: FieldValue.serverTimestamp(),
            });

            const updatePayload: { [key: string]: FieldValue } = {
                'feedbackSummary.totalResponses': FieldValue.increment(1),
            };

            if (feedbackData.registrationRating) {
                updatePayload[`feedbackSummary.registrationRating.${feedbackData.registrationRating}`] =
                    FieldValue.increment(1);
            }
            if (feedbackData.communicationRating) {
                updatePayload[`feedbackSummary.communicationRating.${feedbackData.communicationRating}`] =
                    FieldValue.increment(1);
            }
            if (feedbackData.venueRating) {
                updatePayload[`feedbackSummary.venueRating.${feedbackData.venueRating}`] = FieldValue.increment(1);
            }
            if (feedbackData.pacingRating) {
                updatePayload[`feedbackSummary.pacingRating.${feedbackData.pacingRating}`] = FieldValue.increment(1);
            }

            transaction.update(eventDocRef, updatePayload);
        });
    } catch (error) {
        console.error('Feedback Submission Error:', error);
        return { message: 'Database error: Failed to submit feedback.' };
    }

    revalidatePath(`/e/${eventId}`);

    return { message: 'Thank you! Your feedback has been submitted successfully.', isSuccess: true };
}