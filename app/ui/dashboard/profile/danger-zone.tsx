'use client';

import { useActionState, useState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { deleteSelfAccount, type DeleteAccountState } from '@/app/lib/actions/authActions';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import LoadingSpinner from "@/app/ui/dashboard/loading-spinner";

function DeleteButton() {
    const { pending } = useFormStatus();
    const [isConfirming, setIsConfirming] = useState(false);

    // This click handler adds the confirmation step
    const handleClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        if (!isConfirming) {
            event.preventDefault(); // Prevent form submission on first click
            setIsConfirming(true);
            // Reset confirmation after 3 seconds
            setTimeout(() => setIsConfirming(false), 3000);
        }
        // If isConfirming is true, the form submits normally on the second click
    };

    // If the form submission starts, cancel the confirmation state
    useEffect(() => {
        if (pending) {
            setIsConfirming(false);
        }
    }, [pending]);

    return (
        <button
            type="submit"
            onClick={handleClick}
            disabled={pending}
            className={`w-full justify-center md:w-auto flex items-center px-4 py-2 text-white rounded-md transition-colors duration-200 text-sm font-medium ${
                pending
                    ? 'bg-red-400 cursor-not-allowed'
                    : isConfirming
                        ? 'bg-yellow-500 hover:bg-yellow-600'
                        : 'bg-red-600 hover:bg-red-700'
            }`}
        >
            {pending ? (
                <>
                    <LoadingSpinner className="mr-2 h-5 w-5" />
                    <span>Deleting...</span>
                </>
            ) : isConfirming ? (
                'Click Again to Confirm'
            ) : (
                <span>Delete My Account</span>
            )}
        </button>
    );
}

export default function DangerZone({ userRole }: { userRole: string }) {
    const initialState: DeleteAccountState = { message: undefined, status: 'idle' };
    const [state, dispatch] = useActionState(deleteSelfAccount, initialState);

    return (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/20">
            <div className="flex items-center">
                <ExclamationTriangleIcon className="mr-2 h-5 w-5 text-red-500" />
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-400">Danger Zone</h3>
            </div>
            <div className="mt-4 border-t border-red-200 pt-4 dark:border-red-900/50">
                <form action={dispatch}>
                    <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                        <div className="space-y-1">
                            <p className="font-medium text-gray-900 dark:text-zinc-200">Delete Account</p>
                            <p className="text-sm text-gray-600 dark:text-zinc-400">Permanently delete your account and all associated data. This action cannot be undone.</p>
                        </div>
                        <div className="w-full md:w-auto">
                            {userRole === 'owner' ? (
                                <div className="w-full rounded-md border border-amber-300 bg-amber-50 p-3 text-center text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-400 md:w-auto md:text-left">
                                    Owners cannot delete their account. Please transfer ownership first.
                                </div>
                            ) : (
                                <DeleteButton />
                            )}
                        </div>
                    </div>
                </form>
            </div>
            {state?.message && (
                <p className="mt-3 text-sm text-red-600 dark:text-red-500" aria-live="polite">
                    {state.message}
                </p>
            )}
        </div>
    );
}
