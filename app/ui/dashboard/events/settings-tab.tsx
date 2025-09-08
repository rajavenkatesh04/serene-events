'use client';

import { useActionState, useState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { deleteEvent, type DeleteEventState } from '@/app/lib/actions/eventActions';
import { ExclamationTriangleIcon, PencilIcon } from '@heroicons/react/24/solid';
import LoadingSpinner from "@/app/ui/dashboard/loading-spinner";
import Link from 'next/link';

function DeleteButton() {
    const { pending } = useFormStatus();
    const [isConfirming, setIsConfirming] = useState(false);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        if (!isConfirming) {
            event.preventDefault();
            setIsConfirming(true);
            setTimeout(() => setIsConfirming(false), 3000);
        }
    };

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
            className={`w-full justify-center md:w-auto flex items-center px-4 py-2 text-white rounded-md transition-colors duration-200 ${
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
                <span>Delete this Event</span>
            )}
        </button>
    );
}

export default function SettingsTab({ eventId }: { eventId: string }) {
    const initialState: DeleteEventState = { message: undefined };
    const [state, dispatch] = useActionState(deleteEvent, initialState);

    return (
        <div className="space-y-8">
            {/* General Settings Section */}
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-zinc-100">General Settings</h3>
                <div className="flex flex-col items-start justify-between gap-4 border-t border-gray-200 pt-4 dark:border-zinc-800 md:flex-row md:items-center">
                    <div className="space-y-1">
                        <p className="font-medium text-gray-900 dark:text-zinc-200">Edit Event Details</p>
                        <p className="text-sm text-gray-600 dark:text-zinc-400">Update the title and description of your event.</p>
                    </div>
                    <Link
                        href={`/dashboard/events/${eventId}/edit`}
                        className="flex w-full items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 md:w-auto"
                    >
                        <PencilIcon className="h-4 w-4" />
                        Edit
                    </Link>
                </div>
            </div>

            {/* Danger Zone */}
            <div>
                <div className="rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/20">
                    <div className="flex items-center">
                        <ExclamationTriangleIcon className="mr-2 h-5 w-5 text-red-500" />
                        <h3 className="text-lg font-semibold text-red-800 dark:text-red-400">Danger Zone</h3>
                    </div>
                    <p className="mt-1 text-sm text-red-700 dark:text-red-400/80">
                        This action is destructive and cannot be reversed. Please proceed with caution.
                    </p>
                    <div className="mt-4 border-t border-red-200 pt-4 dark:border-red-900/50">
                        <form action={dispatch}>
                            <input type="hidden" name="eventId" value={eventId} />
                            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                                <div className="space-y-1">
                                    <p className="font-medium text-gray-900 dark:text-zinc-200">Delete Event</p>
                                    <p className="text-sm text-gray-600 dark:text-zinc-400">This will permanently delete the event and all associated data.</p>
                                </div>
                                <div className="w-full md:w-auto">
                                    <DeleteButton />
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Error message now appears outside and below the box */}
                {state?.message && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-500" aria-live="polite">
                        {state.message}
                    </p>
                )}
            </div>
        </div>
    );
}