'use client';

import { useActionState } from "react";
import { useFormStatus } from 'react-dom';
import { createEvent, CreateEventState } from '@/app/lib/actions/eventActions';
import Link from 'next/link';
import LoadingSpinner from "@/app/ui/dashboard/loading-spinner";

// Themed submit button - styled to be a primary action
function CreateButton() {
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
                    <span>Creating...</span>
                </>
            ) : (<span>Create Event</span>)}
        </button>
    );
}

export default function CreateEventPage() {
    const initialState: CreateEventState = { message: null, errors: {} };
    const [state, dispatch] = useActionState(createEvent, initialState);

    return (
        <main>
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-100">
                    Launch Your Next Event
                </h1>
                <p className="mt-2 text-gray-600 dark:text-zinc-400">
                    Provide the core details to generate your unique event page.
                </p>
            </div>

            <form action={dispatch}>
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
                                    <input id="title" name="title" type="text" placeholder="The name of your event" className="block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-zinc-700 dark:bg-zinc-800" required />
                                    {state.errors?.title && <p className="mt-2 text-xs text-red-500">{state.errors.title}</p>}
                                </div>
                                <div>
                                    <label htmlFor="description" className="mb-2 block text-sm font-medium">Description</label>
                                    <textarea id="description" name="description" placeholder="Tell everyone what your event is about in a few sentences." rows={5} className="block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-zinc-700 dark:bg-zinc-800" />
                                </div>
                            </div>
                        </div>

                        {/* Schedule Card */}
                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">Schedule & Location</h2>
                            <div className="mt-4 space-y-6">
                                <div>
                                    <label htmlFor="locationText" className="mb-2 block text-sm font-medium">Location</label>
                                    <input id="locationText" name="locationText" type="text" placeholder="e.g., Main Auditorium, New York" className="block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-zinc-700 dark:bg-zinc-800" required />
                                    {state.errors?.locationText && <p className="mt-2 text-xs text-red-500">{state.errors.locationText}</p>}
                                </div>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="startsAt" className="mb-2 block text-sm font-medium">Starts At</label>
                                        <input id="startsAt" name="startsAt" type="datetime-local" className="block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-zinc-700 dark:bg-zinc-800" required />
                                        {state.errors?.startsAt && <p className="mt-2 text-xs text-red-500">{state.errors.startsAt}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="endsAt" className="mb-2 block text-sm font-medium">Ends At</label>
                                        <input id="endsAt" name="endsAt" type="datetime-local" className="block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-zinc-700 dark:bg-zinc-800" required />
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
                            <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">Add links to your event&apos;s logo and banner images.</p>
                            <div className="mt-4 space-y-6">
                                <div>
                                    <label htmlFor="logoUrl" className="mb-2 block text-sm font-medium">Logo URL</label>
                                    <input id="logoUrl" name="logoUrl" type="url" placeholder="https://..." className="block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-zinc-700 dark:bg-zinc-800" />
                                    {state.errors?.logoUrl && <p className="mt-2 text-xs text-red-500">{state.errors.logoUrl}</p>}
                                </div>
                                <div>
                                    <label htmlFor="bannerUrl" className="mb-2 block text-sm font-medium">Banner URL</label>
                                    <input id="bannerUrl" name="bannerUrl" type="url" placeholder="https://..." className="block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 shadow-sm focus:border-rose-500 focus:ring-rose-500 dark:border-zinc-700 dark:bg-zinc-800" />
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
                        href="/dashboard/events"
                        className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    >
                        Cancel
                    </Link>
                    <CreateButton />
                </div>
            </form>
        </main>
    );
}