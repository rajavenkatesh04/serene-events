import { Suspense } from 'react';
import { auth } from '@/app/lib/firebase-admin';
import { notFound } from 'next/navigation';
import { fetchAllFeedback } from '@/app/lib/data';
import FeedbackTab from '@/app/ui/dashboard/events/feedback-tab';
import { EventDetailsPageSkeleton } from '@/app/ui/skeletons';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth.getSession();
    if (!session) notFound();

    const { id } = await params;

    // Fetch all feedback responses for the given event
    const responses = await fetchAllFeedback(session.uid, id);

    return (
        <Suspense fallback={<EventDetailsPageSkeleton />}>
            <FeedbackTab responses={responses} />
        </Suspense>
    );
}