'use client';

import { useActionState } from "react";
import { useFormStatus } from 'react-dom';
import { updateEvent, UpdateEventState } from '@/app/lib/actions/eventActions';
import Link from 'next/link';
import { Event } from '@/app/lib/definitions';
import LoadingSpinner from "@/app/ui/dashboard/loading-spinner";

// Helper function to format Firestore Timestamp for the datetime-local input
function formatTimestampForInput(timestamp: { seconds: number; nanoseconds: number; }) {
    const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
    // The slice(0, 16) is to format it as "YYYY-MM-DDTHH:mm" which the input expects
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
}

function UpdateButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400"
        >
            {pending ? (
                <>
                    <LoadingSpinner className="mr-2" />
                    <span>Saving...</span>
                </>
            ) : (<span>Save Changes</span>)}
        </button>
    );
}

export default function EditEventForm({ event }: { event: Event }) {
    const initialState: UpdateEventState = { message: null, errors: {} };
    const [state, dispatch] = useActionState(updateEvent, initialState);

    return (
        <form action={dispatch}>
            <div className="rounded-md border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 md:p-6">
                {/* --- IMPORTANT: Hidden fields for IDs --- */}
                <input type="hidden" name="docId" value={event.docId} />
                <input type="hidden" name="id" value={event.id} />

                {/* --- Event Title & Description --- */}
                <div className="mb-4">
                    <label htmlFor="title" className="mb-2 block text-sm font-medium text-gray-900 dark:text-zinc-100">
                        Event Title
                    </label>
                    <input
                        id="title"
                        name="title"
                        type="text"
                        defaultValue={event.title}
                        className="block w-full rounded-md border border-gray-200 bg-gray-50 py-2 px-3 text-sm text-gray-900 placeholder:text-gray-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                        required
                    />
                    {state.errors?.title && <p className="mt-2 text-xs text-red-500">{state.errors.title}</p>}
                </div>

                <div className="mb-4">
                    <label htmlFor="description" className="mb-2 block text-sm font-medium text-gray-900 dark:text-zinc-100">
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        defaultValue={event.description}
                        rows={4}
                        className="block w-full rounded-md border border-gray-200 bg-gray-50 py-2 px-3 text-sm text-gray-900 placeholder:text-gray-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                    />
                </div>

                {/* --- NEW: Status Dropdown --- */}
                <div className="mb-4">
                    <label htmlFor="status" className="mb-2 block text-sm font-medium text-gray-900 dark:text-zinc-100">
                        Event Status
                    </label>
                    <select
                        id="status"
                        name="status"
                        defaultValue={event.status}
                        className="block w-full rounded-md border border-gray-200 bg-gray-50 py-2 px-3 text-sm text-gray-900 placeholder:text-gray-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                        required
                    >
                        <option value="scheduled">Scheduled</option>
                        <option value="live">Live</option>
                        <option value="paused">Paused</option>
                        <option value="ended">Ended</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    {state.errors?.status && <p className="mt-2 text-xs text-red-500">{state.errors.status}</p>}
                </div>

                {/* --- NEW: Location and Timing (with default values) --- */}
                <div className="mb-4">
                    <label htmlFor="locationText" className="mb-2 block text-sm font-medium text-gray-900 dark:text-zinc-100">
                        Location
                    </label>
                    <input
                        id="locationText"
                        name="locationText"
                        type="text"
                        defaultValue={event.locationText}
                        className="block w-full rounded-md border border-gray-200 bg-gray-50 py-2 px-3 text-sm text-gray-900 placeholder:text-gray-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                        required
                    />
                    {state.errors?.locationText && <p className="mt-2 text-xs text-red-500">{state.errors.locationText}</p>}
                </div>

                <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label htmlFor="startsAt" className="mb-2 block text-sm font-medium text-gray-900 dark:text-zinc-100">
                            Starts At
                        </label>
                        <input
                            id="startsAt"
                            name="startsAt"
                            type="datetime-local"
                            defaultValue={formatTimestampForInput(event.startsAt)}
                            className="block w-full rounded-md border border-gray-200 bg-gray-50 py-2 px-3 text-sm text-gray-900 placeholder:text-gray-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                            required
                        />
                        {state.errors?.startsAt && <p className="mt-2 text-xs text-red-500">{state.errors.startsAt}</p>}
                    </div>
                    <div>
                        <label htmlFor="endsAt" className="mb-2 block text-sm font-medium text-gray-900 dark:text-zinc-100">
                            Ends At
                        </label>
                        <input
                            id="endsAt"
                            name="endsAt"
                            type="datetime-local"
                            defaultValue={formatTimestampForInput(event.endsAt)}
                            className="block w-full rounded-md border border-gray-200 bg-gray-50 py-2 px-3 text-sm text-gray-900 placeholder:text-gray-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                            required
                        />
                        {state.errors?.endsAt && <p className="mt-2 text-xs text-red-500">{state.errors.endsAt}</p>}
                    </div>
                </div>

                {/* --- NEW: Branding URLs (with default values) --- */}
                <div className="mb-4">
                    <label htmlFor="logoUrl" className="mb-2 block text-sm font-medium text-gray-900 dark:text-zinc-100">
                        Logo URL (Optional)
                    </label>
                    <input
                        id="logoUrl"
                        name="logoUrl"
                        type="url"
                        defaultValue={event.logoUrl || ''}
                        placeholder="https://..."
                        className="block w-full rounded-md border border-gray-200 bg-gray-50 py-2 px-3 text-sm text-gray-900 placeholder:text-gray-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                    />
                    {state.errors?.logoUrl && <p className="mt-2 text-xs text-red-500">{state.errors.logoUrl}</p>}
                </div>

                <div className="mb-4">
                    <label htmlFor="bannerUrl" className="mb-2 block text-sm font-medium text-gray-900 dark:text-zinc-100">
                        Banner URL (Optional)
                    </label>
                    <input
                        id="bannerUrl"
                        name="bannerUrl"
                        type="url"
                        defaultValue={event.bannerUrl || ''}
                        placeholder="https://..."
                        className="block w-full rounded-md border border-gray-200 bg-gray-50 py-2 px-3 text-sm text-gray-900 placeholder:text-gray-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                    />
                    {state.errors?.bannerUrl && <p className="mt-2 text-xs text-red-500">{state.errors.bannerUrl}</p>}
                </div>

                {/* General Error Message */}
                {state.message && (
                    <div className="mb-4">
                        <p className="text-sm text-red-600 dark:text-red-500">{state.message}</p>
                    </div>
                )}
            </div>
            <div className="mt-6 flex justify-end gap-4">
                <Link
                    href={`/dashboard/events/${event.id}`}
                    className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                    Cancel
                </Link>
                <UpdateButton />
            </div>
        </form>
    );
}