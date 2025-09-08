"use server";

import { z } from "zod";
import {signOut} from 'firebase/auth';
import { auth } from '@/app/lib/firebase';
import { auth as adminAuth } from '@/app/lib/firebase-admin';
import { masterAuth  } from '@/app/lib/firebase-admin';
import { adminDb } from "@/app/lib/firebase-server";
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

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


// =================================================================================
// --- USER & PROFILE ACTIONS ---
// =================================================================================

export type CompleteProfileState = {
    message?: string;
    errors?: {
        organizationName?: string[];
        username?: string[];
    };
    status?: 'success' | 'error'; // Status to signal the client
};

const CompleteProfileSchema = z.object({
    organizationName: z.string().min(2, { message: "Organization name must be at least 2 characters." }),
    username: z.string()
        .min(3, { message: "Username must be at least 3 characters." })
        .max(20, { message: "Username cannot be more than 20 characters." })
        .regex(/^[a-z0-9_]+$/, { message: "Username can only contain lowercase letters, numbers, and underscores." }),
});

export async function completeUserProfile(
    prevState: CompleteProfileState | null,
    formData: FormData
): Promise<CompleteProfileState> {
    const session = await adminAuth.getSession();
    if (!session?.uid || !session.email) {
        return { message: "Authentication error. Please sign in again.", status: 'error' };
    }

    const validatedFields = CompleteProfileSchema.safeParse({
        organizationName: formData.get('organizationName'),
        username: formData.get('username'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Invalid fields provided.',
            status: 'error',
        };
    }
    const { organizationName, username } = validatedFields.data;

    try {
        await adminDb.runTransaction(async (transaction) => {
            const userDocRef = adminDb.collection('users').doc(session.uid);
            const usernameDocRef = adminDb.collection('usernames').doc(username);

            const userDoc = await transaction.get(userDocRef);
            const usernameDoc = await transaction.get(usernameDocRef);

            if (userDoc.exists) {
                throw new Error("PROFILE_EXISTS");
            }
            if (usernameDoc.exists) {
                throw new Error("USERNAME_TAKEN");
            }

            const orgRef = adminDb.collection('organizations').doc();

            transaction.set(orgRef, {
                name: organizationName,
                ownerUid: session.uid,
                subscriptionTier: 'free',
            });

            transaction.set(userDocRef, {
                uid: session.uid,
                email: session.email,
                displayName: session.name || "User",
                username: username,
                profilePicUrl: null,
                organizationId: orgRef.id,
                role: 'user',
            });

            transaction.set(usernameDocRef, { uid: session.uid });
        });

        // After the transaction is successful, set the custom claims on the Auth record.
        await masterAuth.setCustomUserClaims(session.uid, {
            username: username,
            role: 'owner' // Set the role claim to 'owner'
        });

    } catch (err: unknown) {
        if (err instanceof Error) {
            if (err.message === "PROFILE_EXISTS") {
                redirect('/dashboard');
            }
            if (err.message === "USERNAME_TAKEN") {
                return {
                    errors: { username: ["This username is already taken. Please choose another."] },
                    message: "Username unavailable.",
                    status: 'error',
                };
            }
            console.error("Profile Completion Transaction Error:", err);
        }
        return { message: "Failed to create your profile. Please try again.", status: 'error' };
    }
    // Instead of redirecting, return a success status to the client
    return { status: 'success', message: 'Profile created successfully!' };
}
