// app/dashboard/events/page.tsx

import { Suspense } from 'react';
import Link from 'next/link';
import { fetchPaginatedEvents } from '@/app/lib/data';
import { auth } from '@/app/lib/firebase-admin';
import { EventsListSkeleton } from "@/app/ui/skeletons";
import Pagination from '@/app/ui/announcements/pagination';

type FilterType = 'all' | 'ownedByMe' | 'adminOf';

interface FilterButtonProps {
    filter: FilterType;
    currentFilter: FilterType;
    label: string;
    count?: number;
}

function FilterButton({ filter, currentFilter, label, count }: FilterButtonProps) {
    const isActive = currentFilter === filter;
    const searchParams = new URLSearchParams();
    searchParams.set('filter', filter);

    return (
        <Link
            href={`/dashboard/events?${searchParams.toString()}`}
            className={`
                flex-grow justify-center whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:px-4
                ${isActive
                ? 'bg-gray-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
            }
            `}
        >
            <div className="flex items-center gap-2">
                {label}
                {count !== undefined && (
                    <span className={`
                        rounded-full px-2 py-1 text-xs
                        ${isActive
                        ? 'bg-white/20 text-white dark:bg-zinc-900/20 dark:text-zinc-900'
                        : 'bg-gray-200 text-gray-600 dark:bg-zinc-700 dark:text-zinc-400'
                    }
                    `}>
                        {count}
                    </span>
                )}
            </div>
        </Link>
    );
}

async function EventsList({
                              currentPage,
                              filter
                          }: {
    currentPage: number;
    filter: FilterType;
}) {
    const session = await auth.getSession();
    if (!session) return null;

    // Fetch the paginated data with filters
    const { events, totalPages, counts } = await fetchPaginatedEvents(
        session.uid,
        currentPage,
        filter
    );

    return (
        <>
            {/* Filter Buttons */}
            <div className="mb-6 flex gap-2 sm:gap-3">
                <FilterButton
                    filter="all"
                    currentFilter={filter}
                    label="All Events"
                    count={counts?.all}
                />
                <FilterButton
                    filter="ownedByMe"
                    currentFilter={filter}
                    label="My Events"
                    count={counts?.ownedByMe}
                />
                <FilterButton
                    filter="adminOf"
                    currentFilter={filter}
                    label="Invited"
                    count={counts?.adminOf}
                />
            </div>

            <div className="flex flex-col justify-between" style={{ minHeight: '60vh' }}>
                <div className="space-y-4">
                    {events.length > 0 ? (
                        events.map(event => {
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

                                    <p className="truncate text-gray-600 dark:text-zinc-400">{event.description || 'No description'}</p>
                                    <div className="mt-4 border-t border-gray-200 pt-4 dark:border-zinc-800">
                                        <p className="text-sm text-gray-500 dark:text-zinc-500">
                                            Event ID: <span className="mx-2 rounded bg-gray-100 px-2 py-1 font-mono text-gray-600 dark:bg-zinc-800 dark:text-zinc-300">{event.id}</span>
                                        </p>
                                    </div>
                                </Link>
                            );
                        })
                    ) : (
                        <div className="rounded-lg border border-dashed border-gray-300 bg-white py-12 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-zinc-100">
                                {filter === 'all' && "No events yet!"}
                                {filter === 'ownedByMe' && "No events owned by you!"}
                                {filter === 'adminOf' && "No events where you're an admin!"}
                            </h3>
                            <p className="mt-2 text-gray-500 dark:text-zinc-400">
                                {filter === 'all' && (
                                    <>Click the <span className="font-semibold text-gray-800 dark:text-zinc-100">+ Create Event</span> button to get started.</>
                                )}
                                {filter === 'ownedByMe' && (
                                    <>Click the <span className="font-semibold text-gray-800 dark:text-zinc-100">+ Create Event</span> button to create your first event.</>
                                )}
                                {filter === 'adminOf' && (
                                    <>You haven&apos;t been added as an admin to any events yet.</>
                                )}
                            </p>
                        </div>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="mt-8 flex w-full justify-center">
                        <Pagination totalPages={totalPages} />
                    </div>
                )}
            </div>
        </>
    );
}

export default async function Page(props: {
    searchParams?: Promise<{
        page?: string;
        filter?: string;
    }>;
}) {
    // Await searchParams before accessing its properties
    const searchParams = await props.searchParams;
    const currentPage = Number(searchParams?.page) || 1;
    const filter = (searchParams?.filter as FilterType) || 'all';

    // Validate filter parameter
    const validFilters: FilterType[] = ['all', 'ownedByMe', 'adminOf'];
    const activeFilter = validFilters.includes(filter) ? filter : 'all';

    return (
        <main>
            <div className="mb-8 flex items-center justify-between">
                <h1 className="text-3xl font-semibold text-gray-900 dark:text-zinc-100">My Events</h1>
                <Link
                    href="/dashboard/events/create"
                    className="flex h-10 items-center rounded-lg bg-gray-900 px-4 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                    <span className="mr-2 text-lg font-bold">+</span> Create Event
                </Link>
            </div>

            <Suspense key={`${currentPage}-${activeFilter}`} fallback={<EventsListSkeleton />}>
                <EventsList currentPage={currentPage} filter={activeFilter} />
            </Suspense>
        </main>
    );
}