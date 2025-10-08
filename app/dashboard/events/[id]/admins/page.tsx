// app/dashboard/events/[id]/admins/page.tsx
import { Suspense } from 'react';
import { auth } from '@/app/lib/firebase-admin';
import { fetchEventById, fetchUserProfile, fetchUsersByUid, fetchEventInvitations } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import AdminsTab from '@/app/ui/dashboard/events/admins-tab';
import { AdminsTabSkeleton } from '@/app/ui/skeletons';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth.getSession();
    if (!session) notFound();

    const { id } = await params;

    // This page needs to fetch data specific to the Admins tab.
    const [event, userProfile] = await Promise.all([
        fetchEventById(session.uid, id),
        fetchUserProfile(session.uid),
    ]);

    if (!event || !userProfile) notFound();

    const [adminUsers, sentInvites] = await Promise.all([
        fetchUsersByUid(event.admins),
        fetchEventInvitations(event.docId),
    ]);

    return (
        <Suspense fallback={<AdminsTabSkeleton />}>
            <AdminsTab
                eventDocId={event.docId}
                eventShortId={event.id}
                admins={adminUsers}
                orgId={userProfile.organizationId}
                ownerUid={event.ownerUid}
                currentUserId={session.uid}
                sentInvites={sentInvites}
            />
        </Suspense>
    );
}
