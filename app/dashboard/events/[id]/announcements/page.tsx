// app/dashboard/events/[id]/announcements/page.tsx
import { Suspense } from 'react';
import { auth } from '@/app/lib/firebase-admin';
import { fetchEventById } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import AnnouncementsTab from '@/app/ui/dashboard/events/announcements-tab';
import { AnnouncementsTabSkeleton } from '@/app/ui/skeletons';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth.getSession();
    if (!session) notFound();

    const { id } = await params;

    // Fetch the event to get the full docId and orgId needed by the AnnouncementsTab
    const event = await fetchEventById(session.uid, id);
    if (!event) notFound();

    return (
        <Suspense fallback={<AnnouncementsTabSkeleton />}>
            <AnnouncementsTab eventId={event.docId} orgId={event.organizationId} />
        </Suspense>
    );
}