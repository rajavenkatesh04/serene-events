import Link from 'next/link';
import { ArchiveBoxIcon } from '@heroicons/react/24/outline';
import type { Event } from '@/app/lib/definitions';

export default function PastEventsPage() {
    // This is the placeholder data. When you have a backend, you'll fetch
    // real data and conditionally render the empty state or the list.
    const pastEvents: Event[] = [];

    return (
        <main>
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-zinc-100">
                Past Events
            </h1>
            <p className="mt-1 text-gray-600 dark:text-zinc-400">
                A history of events that you have created or managed.
            </p>

            <div className="mt-6">
                {pastEvents.length > 0 ? (
                    // --- EVENTUALLY, YOUR LIST OF PAST EVENTS WILL GO HERE ---
                    <div>
                        {/* Example: <PastEventsList events={pastEvents} /> */}
                    </div>
                ) : (
                    // --- THIS IS THE DESIGNED EMPTY STATE ---
                    <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white py-16 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="flex flex-col items-center">
                            <ArchiveBoxIcon className="h-12 w-12 text-gray-400 dark:text-zinc-500" aria-hidden="true" />
                            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-zinc-100">
                                No Past Events Found
                            </h3>
                            <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
                                Events you manage will be archived here after they conclude.
                            </p>
                            <p className="mt-4 text-sm text-gray-500 dark:text-zinc-400">
                                Looking for something else?{' '}
                                <Link href="/dashboard/events" className="font-medium text-pink-600 hover:underline dark:text-pink-500">
                                    View upcoming events
                                </Link>.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}