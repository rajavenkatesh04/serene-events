// app/dashboard/events/[id]/page.tsx
import { Suspense } from 'react';
import { auth } from '@/app/lib/firebase-admin';
import { notFound } from 'next/navigation';
import { EventDetailsPageSkeleton } from '@/app/ui/skeletons';
import OverviewTab from '@/app/ui/dashboard/events/overview-tab';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth.getSession();
    if (!session) notFound();

    const { id } = await params;

    return (
        <Suspense fallback={<EventDetailsPageSkeleton />}>
            <OverviewTab eventId={id} userId={session.uid} />
        </Suspense>
    );
}