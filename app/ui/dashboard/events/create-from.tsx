'use client';

import { useActionState } from "react";
import { useFormStatus } from 'react-dom';
import { createEvent, CreateEventState } from '@/app/lib/actions/eventActions';
import Link from 'next/link';
import LoadingSpinner from "@/app/ui/dashboard/loading-spinner";

function CreateButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="flex h-10 items-center rounded-lg bg-gray-900 px-4 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
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

export default function CreateEventForm() {
    const initialState: CreateEventState = { message: null, errors: {} };
    const [state, dispatch] = useActionState(createEvent, initialState);

    return (
        <form action={dispatch}>
            <div className="rounded-md border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 md:p-6">
                {/* Event Title */}
                <div className="mb-4">
                    <label htmlFor="title" className="mb-2 block text-sm font-medium text-gray-900 dark:text-zinc-100">
                        Event Title
                    </label>
                    <input
                        id="title"
                        name="title"
                        type="text"
                        placeholder="Enter the name of your event"
                        className="block w-full rounded-md border border-gray-200 bg-gray-50 py-2 px-3 text-sm text-gray-900 placeholder:text-gray-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                        required
                    />
                    {state.errors?.title && <p className="mt-2 text-xs text-red-500">{state.errors.title}</p>}
                </div>

                {/* Event Description */}
                <div className="mb-4">
                    <label htmlFor="description" className="mb-2 block text-sm font-medium text-gray-900 dark:text-zinc-100">
                        Description (Optional)
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        placeholder="Tell us a little about your event"
                        rows={4}
                        className="block w-full rounded-md border border-gray-200 bg-gray-50 py-2 px-3 text-sm text-gray-900 placeholder:text-gray-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                    />
                </div>

                {/* Event location*/}
                <div className="mb-4">
                    <label htmlFor="locationText" className="mb-2 block text-sm font-medium text-gray-900 dark:text-zinc-100">Location</label>
                    <input
                        id="locationText"
                        name="locationText"
                        type="text"
                        placeholder="e.g., Main Auditorium, SRM Campus"
                        className="block w-full rounded-md border border-gray-200 bg-gray-50 py-2 px-3 text-sm text-gray-900 placeholder:text-gray-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                        required
                    />
                    {state.errors?.locationText && <p className="mt-2 text-xs text-red-500">{state.errors.locationText}</p>}
                </div>

                {/* Event start and end time */}
                <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label htmlFor="startsAt" className="mb-2 block text-sm font-medium text-gray-900 dark:text-zinc-100">
                            Starts At
                        </label>
                        <input
                            id="startsAt"
                            name="startsAt"
                            type="datetime-local"
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
                            className="block w-full rounded-md border border-gray-200 bg-gray-50 py-2 px-3 text-sm text-gray-900 placeholder:text-gray-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                            required
                        />
                        {state.errors?.endsAt && <p className="mt-2 text-xs text-red-500">{state.errors.endsAt}</p>}
                    </div>
                </div>

                {/* Event branding */}
                <div className="mb-4">
                    <label htmlFor="logoUrl" className="mb-2 block text-sm font-medium text-gray-900 dark:text-zinc-100">
                        Logo URL (Optional)
                    </label>
                    <input
                        id="logoUrl"
                        name="logoUrl"
                        type="url"
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
                    href="/dashboard/events"
                    className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                    Cancel
                </Link>
                <CreateButton />
            </div>
        </form>
    );
}