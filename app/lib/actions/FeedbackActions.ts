'use server';

import { z } from 'zod';
import { auth as adminAuth } from '@/app/lib/firebase-admin';
import { adminDb } from '@/app/lib/firebase-server';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

// ✨ UPDATED: Zod schema to match the new form structure
const SubmitFeedbackSchema = z.object({
    eventId: z.string().min(1, 'Event ID is missing.'),
    fullName: z.string().min(2, 'Full name is required.'),
    email: z.string().email('Please enter a valid email address.'),
    registrationId: z.string().optional(),

    // New event ratings
    overallExperienceRating: z.string().min(1, 'Please rate your overall experience.'),
    communicationRating: z.string().min(1, 'Please rate the pre-event communication.'),
    lunchRating: z.string().min(1, 'Please rate the lunch provided.'),

    // New comment fields
    eventImprovementComments: z.string().min(1, 'Please provide feedback for the event.'),

    // Platform-specific fields
    platformUsefulnessRating: z.string().min(1, 'Please rate the platform usefulness.'),
    platformImprovementComments: z.string().min(1, 'Please provide feedback for the platform.'),
});

// ✨ UPDATED: State type to match the new schema for displaying errors
export type SubmitFeedbackState = {
    message?: string | null;
    errors?: {
        fullName?: string[];
        email?: string[];
        overallExperienceRating?: string[];
        communicationRating?: string[];
        lunchRating?: string[];
        eventImprovementComments?: string[];
        platformUsefulnessRating?: string[];
        platformImprovementComments?: string[];
    };
    isSuccess?: boolean;
};

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

            // ✨ FIXED: Transaction payload - removed sanitization for consistent data structure
            const updatePayload: { [key: string]: FieldValue } = {
                'feedbackSummary.totalResponses': FieldValue.increment(1),
            };

            // All ratings use the same field structure without sanitization
            if (feedbackData.overallExperienceRating) {
                updatePayload[`feedbackSummary.overallExperienceRating.${feedbackData.overallExperienceRating}`] =
                    FieldValue.increment(1);
            }
            if (feedbackData.communicationRating) {
                updatePayload[`feedbackSummary.communicationRating.${feedbackData.communicationRating}`] =
                    FieldValue.increment(1);
            }
            if (feedbackData.lunchRating) {
                updatePayload[`feedbackSummary.lunchRating.${feedbackData.lunchRating}`] = FieldValue.increment(1);
            }
            if (feedbackData.platformUsefulnessRating) {
                // FIXED: Store platform ratings as-is without sanitization
                updatePayload[`feedbackSummary.platformUsefulnessRating.${feedbackData.platformUsefulnessRating}`] =
                    FieldValue.increment(1);
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