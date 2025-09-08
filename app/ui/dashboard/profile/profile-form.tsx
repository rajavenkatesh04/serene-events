'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateUserProfile, type UpdateProfileState } from '@/app/lib/actions/authActions';
import LoadingSpinner from '@/app/ui/dashboard/loading-spinner';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';

// A dedicated button component to show loading state
function SaveButton() {
    // ... (This component remains the same)
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="flex h-10 w-full items-center justify-center rounded-lg bg-gray-900 px-4 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 md:w-auto"
        >
            {pending ? (
                <>
                    <LoadingSpinner className="mr-2" />
                    <span>Saving...</span>
                </>
            ) : (
                <span>Save Changes</span>
            )}
        </button>
    );
}

// The main form component
export default function ProfileForm({ user }: { user: { displayName: string; email: string; } }) {
    const initialState: UpdateProfileState = { message: null, errors: {}, status: 'idle' };
    const [state, dispatch] = useActionState(updateUserProfile, initialState);

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-zinc-100">Profile Information</h3>

            {/* MODIFIED: The border is now on the form, and the inputs are wrapped for spacing */}
            <form action={dispatch} className="border-t border-gray-200 pt-4 dark:border-zinc-800">
                <div className="space-y-4">
                    {/* Display Name Input */}
                    <div>
                        <label htmlFor="displayName" className="mb-2 block text-sm font-medium text-gray-900 dark:text-zinc-100">
                            Display Name
                        </label>
                        <input
                            id="displayName"
                            name="displayName"
                            type="text"
                            defaultValue={user.displayName}
                            placeholder="Enter your name"
                            className="block w-full rounded-md border border-gray-200 bg-gray-50 py-2 px-3 text-sm text-gray-900 placeholder:text-gray-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                            required
                        />
                        {state.errors?.displayName && <p className="mt-2 text-xs text-red-500">{state.errors.displayName}</p>}
                    </div>

                    {/* Email (Read-only) */}
                    <div>
                        <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-900 dark:text-zinc-100">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={user.email}
                            readOnly
                            className="block w-full cursor-not-allowed rounded-md border border-gray-200 bg-gray-100 py-2 px-3 text-sm text-gray-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                        />
                    </div>
                </div>

                {/* MODIFIED: Removed the border from the footer, added top margin for spacing */}
                <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                        {state.status === 'success' && (
                            <div className="flex items-center gap-2 text-green-600 dark:text-green-500">
                                <CheckCircleIcon className="h-5 w-5" />
                                <span>{state.message}</span>
                            </div>
                        )}
                        {state.status === 'error' && (
                            <div className="flex items-center gap-2 text-red-600 dark:text-red-500">
                                <ExclamationCircleIcon className="h-5 w-5" />
                                <span>{state.message}</span>
                            </div>
                        )}
                    </div>
                    <SaveButton />
                </div>
            </form>
        </div>
    );
}