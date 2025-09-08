'use client';

import { useActionState } from "react";
import { useFormStatus } from 'react-dom';
import { updateEvent, UpdateEventState } from '@/app/lib/actions/eventActions';
import Link from 'next/link';
import { Event } from '@/app/lib/definitions';
import LoadingSpinner from "@/app/ui/dashboard/loading-spinner";

// Helper function to format Firestore Timestamp for the datetime-local input
function formatTimestampForInput(timestamp: { seconds: number; nanoseconds: number; }) {
    if (!timestamp || typeof timestamp.seconds !== 'number') {
        // Return a default value or an empty string if timestamp is invalid
        return '';
    }
    const date = new Date(timestamp.seconds * 1000 + (timestamp.nanoseconds || 0) / 1000000);
    // The slice(0, 16) is to format it as "YYYY-MM-DDTHH:mm" which the input expects
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
}

// Themed submit button for updating
function UpdateButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="flex h-10 items-center justify-center rounded-lg bg-rose-600 px-6 text-sm font-medium text-white shadow-sm transition-colors hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950 disabled:cursor-not-allowed disabled:bg-rose-400"
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
            {/* --- IMPORTANT: Hidden fields must be inside the form --- */}
            <input type="hidden" name="docId" value={event.docId} />
            <input type="hidden" name="id" value={event.id} />

            {/* --- Main Two-Column Layout --- */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

                {/* --- Left Column: Core Details --- */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Event Details Card */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">Core Information</h2>
                        <div className="mt-4 space-y-6">
                            <div>
                                <label htmlFor="title" className="mb-2 block text-sm font-medium">Title</label>
                                <input id="title" name="title" type="text" defaultValue={event.title} className="block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-zinc-700 dark:bg-zinc-800" required />
                                {state.errors?.title && <p className="mt-2 text-xs text-red-500">{state.errors.title}</p>}
                            </div>
                            <div>
                                <label htmlFor="description" className="mb-2 block text-sm font-medium">Description</label>
                                <textarea id="description" name="description" defaultValue={event.description} rows={5} className="block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-zinc-700 dark:bg-zinc-800" />
                            </div>
                            <div>
                                <label htmlFor="status" className="mb-2 block text-sm font-medium">Event Status</label>
                                <select id="status" name="status" defaultValue={event.status} className="block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-zinc-700 dark:bg-zinc-800" required >
                                    <option value="scheduled">Scheduled</option>
                                    <option value="live">Live</option>
                                    <option value="paused">Paused</option>
                                    <option value="ended">Ended</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                {state.errors?.status && <p className="mt-2 text-xs text-red-500">{state.errors.status}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Schedule Card */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">Schedule & Location</h2>
                        <div className="mt-4 space-y-6">
                            <div>
                                <label htmlFor="locationText" className="mb-2 block text-sm font-medium">Location</label>
                                <input id="locationText" name="locationText" type="text" defaultValue={event.locationText} className="block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-zinc-700 dark:bg-zinc-800" required />
                                {state.errors?.locationText && <p className="mt-2 text-xs text-red-500">{state.errors.locationText}</p>}
                            </div>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="startsAt" className="mb-2 block text-sm font-medium">Starts At</label>
                                    <input id="startsAt" name="startsAt" type="datetime-local" defaultValue={formatTimestampForInput(event.startsAt)} className="block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-zinc-700 dark:bg-zinc-800" required />
                                    {state.errors?.startsAt && <p className="mt-2 text-xs text-red-500">{state.errors.startsAt}</p>}
                                </div>
                                <div>
                                    <label htmlFor="endsAt" className="mb-2 block text-sm font-medium">Ends At</label>
                                    <input id="endsAt" name="endsAt" type="datetime-local" defaultValue={formatTimestampForInput(event.endsAt)} className="block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-zinc-700 dark:bg-zinc-800" required />
                                    {state.errors?.endsAt && <p className="mt-2 text-xs text-red-500">{state.errors.endsAt}</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Right Column: Optional Settings --- */}
                <div className="lg:col-span-1">
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">Branding (Optional)</h2>
                        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">Update the links to your event&apos;s logo and banner images.</p>
                        <div className="mt-4 space-y-6">
                            <div>
                                <label htmlFor="logoUrl" className="mb-2 block text-sm font-medium">Logo URL</label>
                                <input id="logoUrl" name="logoUrl" type="url" defaultValue={event.logoUrl || ''} placeholder="https://..." className="block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-zinc-700 dark:bg-zinc-800" />
                                {state.errors?.logoUrl && <p className="mt-2 text-xs text-red-500">{state.errors.logoUrl}</p>}
                            </div>
                            <div>
                                <label htmlFor="bannerUrl" className="mb-2 block text-sm font-medium">Banner URL</label>
                                <input id="bannerUrl" name="bannerUrl" type="url" defaultValue={event.bannerUrl || ''} placeholder="https://..." className="block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-zinc-700 dark:bg-zinc-800" />
                                {state.errors?.bannerUrl && <p className="mt-2 text-xs text-red-500">{state.errors.bannerUrl}</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Form Actions Footer --- */}
            <div className="mt-8 flex items-center justify-end gap-4 border-t border-gray-200 pt-6 dark:border-zinc-800">
                {state.message && (
                    <p className="mr-auto text-sm text-red-600 dark:text-red-500">{state.message}</p>
                )}
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