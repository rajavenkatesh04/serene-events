// app/dashboard/events/[id]/layout.tsx

import { auth } from '@/app/lib/firebase-admin';
import { fetchEventById, fetchUserProfile, fetchUsersByUid, fetchSubscriberCount } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/app/ui/dashboard/events/breadcrumbs';
import EventHeader from '@/app/ui/dashboard/events/EventHeader';
import TabNavigation from './TabNavigation';

type LayoutProps = {
    children: React.ReactNode;
    params: Promise<{ id: string }>;
};

export default async function EventDashboardLayout({ children, params }: LayoutProps) {
    const resolvedParams = await params;
    const { id: eventId } = resolvedParams;

    const session = await auth.getSession();
    if (!session) notFound();

    // --- SHARED DATA FETCHING ---
    // This data is fetched once and shared across all tabs (Overview, Admins, etc.)
    const [event, userProfile, subscriberCount] = await Promise.all([
        fetchEventById(session.uid, eventId),
        fetchUserProfile(session.uid),
        fetchSubscriberCount(session.uid, eventId)
    ]);

    if (!event || !userProfile) notFound();

    const adminUsers = await fetchUsersByUid(event.admins);

    return (
        <main>
            {/* --- SHARED UI COMPONENTS --- */}
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
                {/* The new tab navigation component */}
                <TabNavigation eventId={event.id} />

                {/* The `children` prop will render the specific page for each tab */}
                <div className="py-6">
                    {children}
                </div>
            </div>
        </main>
    );
}