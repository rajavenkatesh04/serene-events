'use client';

import { useActionState, useEffect, Suspense } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth } from '@/app/lib/firebase';
import { completeUserProfile, type CompleteProfileState } from '@/app/lib/actions/authActions';
import LoadingSpinner from '@/app/ui/dashboard/loading-spinner';

// This new component contains the actual form fields.
// This allows us to use the `useFormStatus` hook to affect the entire form.
function ProfileFormContent() {
    const { pending } = useFormStatus();

    return (
        // The <fieldset> element is perfect for this. When disabled,
        // all of its child inputs and buttons are automatically disabled.
        <fieldset disabled={pending} className="space-y-4 group">
            {/* Username Field */}
            <div>
                <label htmlFor="username" className="mb-2 block text-sm font-medium text-gray-700 dark:text-zinc-300 group-disabled:opacity-50">
                    Username
                </label>
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 sm:text-sm">@</span>
                    </div>
                    <input
                        type="text"
                        name="username"
                        id="username"
                        required
                        minLength={3}
                        maxLength={20}
                        placeholder="your_unique_handle"
                        className="block w-full rounded-md border border-gray-300 bg-gray-50 py-2 pl-7 pr-3 text-sm text-gray-900 placeholder:text-gray-400 disabled:cursor-not-allowed dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                        pattern="[a-z0-9_]+"
                        title="Only lowercase letters, numbers, and underscores are allowed."
                    />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-zinc-500 group-disabled:opacity-50">This will be your public name on the platform.</p>
            </div>

            {/* Workspace Name Field */}
            <div>
                <label htmlFor="organizationName" className="mb-2 block text-sm font-medium text-gray-700 dark:text-zinc-300 group-disabled:opacity-50">
                    Workspace Name
                </label>
                <input
                    type="text"
                    name="organizationName"
                    id="organizationName"
                    required
                    minLength={2}
                    placeholder="e.g., My Awesome Project"
                    className="block w-full rounded-md border border-gray-300 bg-gray-50 py-2 px-3 text-sm text-gray-900 placeholder:text-gray-400 disabled:cursor-not-allowed dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                />
            </div>

            {/* The submit button is also inside the fieldset */}
            <button
                type="submit"
                className="flex h-10 w-full items-center justify-center rounded-lg bg-gray-900 px-4 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
                {pending ? (
                    <>
                        <LoadingSpinner className="mr-2" />
                        <span>Please wait...</span>
                    </>
                ) : 'Continue'}
            </button>
        </fieldset>
    );
}

// Separate component that uses useSearchParams
function CompleteProfileForm() {
    const initialState: CompleteProfileState | null = null;
    const [state, formAction] = useActionState(completeUserProfile, initialState);
    const router = useRouter();
    const searchParams = useSearchParams();

    // This effect handles the redirect after the action is successful.
    useEffect(() => {
        if (state?.status === 'success') {
            const updateUserSession = async () => {
                const currentUser = auth.currentUser;
                if (currentUser) {
                    const idToken = await currentUser.getIdToken(true);
                    await fetch('/api/auth/session', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ idToken }),
                    });
                    const redirectUrl = searchParams.get('redirect');
                    router.push(redirectUrl || '/dashboard');
                }
            };
            updateUserSession();
        }
    }, [state, router, searchParams]);

    return (
        <form action={formAction} className="space-y-4 pt-4">
            {/* The form now just wraps our new component */}
            <ProfileFormContent />

            {/* Display errors below the form */}
            {state?.errors?.username && state.errors.username.map((error: string) => (
                <p className="text-center text-xs text-red-600 dark:text-red-500" key={error}>{error}</p>
            ))}
            {state?.errors?.organizationName && state.errors.organizationName.map((error: string) => (
                <p className="text-center text-xs text-red-600 dark:text-red-500" key={error}>{error}</p>
            ))}
            {state?.message && state.status === 'error' && (
                <p className="text-center text-xs text-red-600 dark:text-red-500">{state.message}</p>
            )}
        </form>
    );
}

export default function CompleteProfilePage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-950">
            <div className="relative mx-auto flex w-full max-w-sm flex-col space-y-4 p-4">
                <div className="text-center">
                    <h1 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-zinc-100">One Last Step!</h1>
                    <p className="mt-1 text-gray-500 dark:text-zinc-400">Choose a username and a name for your workspace.</p>
                </div>

                <Suspense fallback={<LoadingSpinner />}>
                    <CompleteProfileForm />
                </Suspense>
            </div>
        </main>
    );
}