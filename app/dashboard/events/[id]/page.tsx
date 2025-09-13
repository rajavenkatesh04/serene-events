import { Suspense } from 'react';
import { auth } from '@/app/lib/firebase-admin';
import { fetchEventById, fetchUserProfile, fetchUsersByUid, fetchSubscriberCount, fetchEventInvitations } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/app/ui/dashboard/events/breadcrumbs';
import Link from 'next/link';
import AnnouncementsTab from '@/app/ui/dashboard/events/announcements-tab';
import AdminsTab from '@/app/ui/dashboard/events/admins-tab';
import SettingsTab from '@/app/ui/dashboard/events/settings-tab';
import clsx from 'clsx';
import { EventDetailsPageSkeleton, AnnouncementsTabSkeleton, AdminsTabSkeleton } from '@/app/ui/skeletons';
import EventHeader from '@/app/ui/dashboard/events/EventHeader'; // Import the new header

type PageProps = {
    params: Promise<{ id: string }>;
    searchParams?: Promise<{ tab?: string }>;
};

async function EventDetails({ params, searchParams }: PageProps) {
    const resolvedParams = await params;
    const { id: eventId } = resolvedParams;
    const resolvedSearchParams = await searchParams;
    const activeTab = resolvedSearchParams?.tab || 'announcements';
    const session = await auth.getSession();
    if (!session) notFound();

    const [event, userProfile, subscriberCount] = await Promise.all([
        fetchEventById(session.uid, eventId),
        fetchUserProfile(session.uid),
        fetchSubscriberCount(session.uid, eventId)
    ]);

    if (!event || !userProfile) notFound();
    const adminUsers = await fetchUsersByUid(event.admins);

    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Events', href: '/dashboard/events' },
                    { label: event.title, href: `/dashboard/events/${event.id}`, active: true },
                ]}
            />

            <EventHeader
                event={event}
                subscriberCount={subscriberCount}
                adminCount={adminUsers.length}
            />

            <div className="w-full">
                <div className="border-b border-gray-200 dark:border-zinc-800">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <Link
                            href={`/dashboard/events/${event.id}?tab=announcements`}
                            className={clsx(
                                "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium",
                                {
                                    'border-blue-500 text-blue-600 dark:text-blue-400': activeTab === 'announcements',
                                    'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-300': activeTab !== 'announcements'
                                }
                            )}
                        >
                            Announcements
                        </Link>
                        <Link
                            href={`/dashboard/events/${event.id}?tab=admins`}
                            className={clsx(
                                "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium",
                                {
                                    'border-blue-500 text-blue-600 dark:text-blue-400': activeTab === 'admins',
                                    'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-300': activeTab !== 'admins'
                                }
                            )}
                        >
                            Admins
                        </Link>
                        <Link
                            href={`/dashboard/events/${event.id}?tab=settings`}
                            className={clsx(
                                "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium",
                                {
                                    'border-blue-500 text-blue-600 dark:text-blue-400': activeTab === 'settings',
                                    'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-300': activeTab !== 'settings'
                                }
                            )}
                        >
                            Settings
                        </Link>
                    </nav>
                </div>

                <div className="py-6">
                    {activeTab === 'announcements' && (
                        <Suspense fallback={<AnnouncementsTabSkeleton />}>
                            <AnnouncementsTab eventId={event.docId} orgId={event.organizationId} />
                        </Suspense>
                    )}
                    {activeTab === 'admins' && (
                        <Suspense fallback={<AdminsTabSkeleton />}>
                            {(async () => {
                                const sentInvites = await fetchEventInvitations(event.docId);
                                return (
                                    <AdminsTab
                                        eventDocId={event.docId}
                                        eventShortId={event.id}
                                        admins={adminUsers}
                                        orgId={userProfile.organizationId}
                                        ownerUid={event.ownerUid}
                                        currentUserId={session.uid}
                                        sentInvites={sentInvites}
                                    />
                                );
                            })()}
                        </Suspense>
                    )}
                    {activeTab === 'settings' && <SettingsTab eventId={event.docId} />}
                </div>
            </div>
        </main>
    );
}

export default function PageWithSuspense(props: PageProps) {
    return (
        <Suspense fallback={<EventDetailsPageSkeleton />}>
            <EventDetails {...props} />
        </Suspense>
    );
}