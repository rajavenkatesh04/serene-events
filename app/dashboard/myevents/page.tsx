import Link from 'next/link';
import { ArchiveBoxIcon, CalendarDaysIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { auth } from '@/app/lib/firebase-admin';
import { fetchUserProfile } from '@/app/lib/data';
import { adminDb } from '@/app/lib/firebase-server';
import { Event } from '@/app/lib/definitions';

// A new data fetcher to get events by their IDs
async function fetchEventsByIds(eventIds: string[]): Promise<Event[]> {
    if (!eventIds || eventIds.length === 0) {
        return [];
    }
    // Firestore 'in' queries are limited to 30 items per query.
    // For a larger scale app, you might need to batch these queries.
    const eventQuery = adminDb.collectionGroup('events').where('id', 'in', eventIds);
    const snapshot = await eventQuery.get();
    return snapshot.docs.map(doc => doc.data() as Event);
}


export default async function PastEventsPage() {
    const session = await auth.getSession();
    if (!session) {
        // Handle case where user is not logged in, though middleware should prevent this
        return null;
    }

    const userProfile = await fetchUserProfile(session.uid);
    const attendedEventIds = userProfile?.attendedEvents || [];
    const pastEvents = await fetchEventsByIds(attendedEventIds);

    return (
        <main>
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-zinc-100">
                Past Events
            </h1>
            <p className="mt-1 text-gray-600 dark:text-zinc-400">
                A history of events that you have attended.
            </p>

            <div className="mt-6">
                {pastEvents.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {pastEvents.map((event) => (
                            <Link
                                href={`/e/${event.id}?tab=chat`}
                                key={event.id}
                                className="group block rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-gray-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
                            >
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{event.title}</h3>
                                <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400 line-clamp-2">{event.description}</p>
                                <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-4 text-sm dark:border-zinc-800">
                                    <div className="flex items-center gap-2 text-gray-500 dark:text-zinc-400">
                                        <CalendarDaysIcon className="h-4 w-4" />
                                        <span>{new Date(event.startsAt.seconds * 1000).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-500 dark:text-zinc-400">
                                        <MapPinIcon className="h-4 w-4" />
                                        <span>{event.locationText}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white py-16 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="flex flex-col items-center">
                            <ArchiveBoxIcon className="h-12 w-12 text-gray-400 dark:text-zinc-500" aria-hidden="true" />
                            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-zinc-100">
                                No Past Events Found
                            </h3>
                            <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
                                When you join an event&apos;s chat, it will appear here for easy access.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}