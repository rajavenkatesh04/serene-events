'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { auth } from '@/app/lib/firebase';
import { completeUserProfile, type CompleteProfileState } from '@/app/lib/actions/authActions';
import LoadingSpinner from '@/app/ui/dashboard/loading-spinner';

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="flex h-10 w-full items-center justify-center rounded-lg bg-gray-900 px-4 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
            {pending ? (
                <>
                    <LoadingSpinner className="mr-2" />
                    <span>Creating Profile...</span>
                </>
            ) : 'Continue to Dashboard'}
        </button>
    );
}

export default function CompleteProfilePage() {
    const initialState: CompleteProfileState | null = null;
    const [state, formAction] = useActionState(completeUserProfile, initialState);
    const router = useRouter();

    // This effect handles the successful state returned from the server action
    useEffect(() => {
        if (state?.status === 'success') {
            const updateUserSession = async () => {
                const currentUser = auth.currentUser;
                if (currentUser) {
                    // 1. Force refresh to get the new ID token with custom claims
                    const idToken = await currentUser.getIdToken(true);

                    // 2. Call your API route to create the new, updated session cookie
                    await fetch('/api/auth/session', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ idToken }),
                    });

                    // 3. Now that the secure cookie is updated, redirect to the dashboard
                    router.push('/dashboard');
                }
            };

            updateUserSession();
        }
    }, [state, router]);

    return (
        <main className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-950">
            <div className="relative mx-auto flex w-full max-w-sm flex-col space-y-4 p-4">
                <div className="text-center">
                    <h1 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-zinc-100">One Last Step!</h1>
                    <p className="mt-1 text-gray-500 dark:text-zinc-400">Choose a username and a name for your workspace.</p>
                </div>

                <form action={formAction} className="space-y-4 pt-4">
                    {/* Username Field */}
                    <div>
                        <label htmlFor="username" className="mb-2 block text-sm font-medium text-gray-700 dark:text-zinc-300">
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
                                className="block w-full rounded-md border border-gray-300 bg-gray-50 py-2 pl-7 pr-3 text-sm text-gray-900 placeholder:text-gray-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                                pattern="[a-z0-9_]+"
                                title="Only lowercase letters, numbers, and underscores are allowed."
                            />
                        </div>
                        <p className="mt-1 text-xs text-gray-500 dark:text-zinc-500">This will be your public name on the platform.</p>
                        {state?.errors?.username &&
                            state.errors.username.map((error: string) => (
                                <p className="mt-2 text-xs text-red-600 dark:text-red-500" key={error}>
                                    {error}
                                </p>
                            ))}
                    </div>

                    {/* Workspace Name Field */}
                    <div>
                        <label htmlFor="organizationName" className="mb-2 block text-sm font-medium text-gray-700 dark:text-zinc-300">
                            Workspace Name
                        </label>
                        <input
                            type="text"
                            name="organizationName"
                            id="organizationName"
                            required
                            minLength={2}
                            placeholder="e.g., My Awesome Project"
                            className="block w-full rounded-md border border-gray-300 bg-gray-50 py-2 px-3 text-sm text-gray-900 placeholder:text-gray-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                        />
                        {state?.errors?.organizationName &&
                            state.errors.organizationName.map((error: string) => (
                                <p className="mt-2 text-xs text-red-600 dark:text-red-500" key={error}>
                                    {error}
                                </p>
                            ))}
                    </div>

                    {/* General Error & Submit Button */}
                    {state?.message && state.status === 'error' && (
                        <p className="text-center text-xs text-red-600 dark:text-red-500">{state.message}</p>
                    )}
                    <SubmitButton />
                </form>
            </div>
        </main>
    );
}