// app/dashboard/events/page.tsx
import { Suspense } from 'react';
import Link from 'next/link';
import { fetchFilteredPaginatedEvents } from '@/app/lib/data';
import { auth } from '@/app/lib/firebase-admin';
import { EventsListSkeleton } from '@/app/ui/skeletons';
import Pagination from '@/app/ui/announcements/pagination';
import EventFilter from '@/app/ui/dashboard/events/filter';

// The list is now its own component to handle data fetching
async function EventsList({
                              filter,
                              currentPage,
                          }: {
    filter: string;
    currentPage: number;
}) {
    const session = await auth.getSession();
    if (!session) return null;

    // Fetch paginated and filtered data
    const { events, totalPages } = await fetchFilteredPaginatedEvents(
        session.uid,
        filter,
        currentPage,
    );

    return (
        <div className="flex flex-col justify-between h-full">
            <div className="space-y-4">
                {events.length > 0 ? (
                    events.map((event) => {
                        const isOwner = event.ownerUid === session.uid;
                        return (
                            <Link
                                href={`/dashboard/events/${event.docId}`}
                                key={event.docId}
                                className="block rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
                            >
                                <div className="mb-2 flex items-center justify-between">
                                    <h3 className="min-w-0 truncate bg-gradient-to-r from-zinc-600 to-zinc-400 bg-clip-text text-xl font-medium text-transparent">
                                        {event.title}
                                    </h3>

                                    <div className="ml-4 flex-shrink-0">
                                        {isOwner ? (
                                            <span className="inline-flex items-center rounded-md bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-900/50 dark:text-amber-300 dark:ring-amber-400/20">
                        Owner
                      </span>
                                        ) : (
                                            <span className="inline-flex items-center rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 ring-1 ring-inset ring-blue-600/20 dark:bg-blue-900/50 dark:text-blue-300 dark:ring-blue-400/20">
                        Admin
                      </span>
                                        )}
                                    </div>
                                </div>

                                <p className="truncate text-gray-600 dark:text-zinc-400">
                                    {event.description || 'No description'}
                                </p>
                                <div className="mt-4 border-t border-gray-200 pt-4 dark:border-zinc-800">
                                    <p className="text-sm text-gray-500 dark:text-zinc-500">
                                        Event ID:{' '}
                                        <span className="mx-2 rounded bg-gray-100 px-2 py-1 font-mono text-gray-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {event.id}
                    </span>
                                    </p>
                                </div>
                            </Link>
                        );
                    })
                ) : (
                    <div className="rounded-lg border border-dashed border-gray-300 bg-white py-12 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-zinc-100">
                            No events found!
                        </h3>
                        <p className="mt-2 text-gray-500 dark:text-zinc-400">
                            Try adjusting your filters or create a new event.
                        </p>
                    </div>
                )}
            </div>

            <div className="mt-8 flex w-full justify-center">
                <Pagination totalPages={totalPages} />
            </div>
        </div>
    );
}

// The main Page component now reads the URL and passes props
export default async function Page({
                                       searchParams,
                                   }: {
    searchParams?: Promise<{
        filter?: string;
        page?: string;
    }>;
}) {
    // Await searchParams before accessing its properties
    const params = await searchParams;
    const currentPage = Number(params?.page) || 1;
    const currentFilter = params?.filter || 'all';

    return (
        <main>
            <div className="mb-8 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-3xl font-semibold text-gray-900 dark:text-zinc-100">
                    Events
                </h1>
                <div className="flex w-full items-center justify-between gap-4 sm:w-auto sm:justify-end">
                    <EventFilter />
                    <Link
                        href="/dashboard/events/create"
                        className="flex h-10 flex-shrink-0 items-center rounded-lg bg-gray-900 px-4 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                    >
                        <span className="mr-2 text-lg font-bold">+</span> Create Event
                    </Link>
                </div>
            </div>
            <Suspense key={currentFilter + currentPage} fallback={<EventsListSkeleton />}>
                <EventsList filter={currentFilter} currentPage={currentPage} />
            </Suspense>
        </main>
    );
}