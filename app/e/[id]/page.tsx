import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { fetchPublicEventByShortId } from '@/app/lib/data';
import EventClientUI from '@/app/e/ui/EventClientUI';
import LoadingSpinner from '@/app/ui/dashboard/loading-spinner';

export default async function PublicEventPage({ params }: { params: Promise<{ id: string }> }) {
    // Await the params before accessing its properties
    const resolvedParams = await params;

    // Call our function with the resolved id
    const data = await fetchPublicEventByShortId(resolvedParams.id);

    // If the function returns null, Next.js will automatically render your not-found.tsx file.
    if (!data) {
        notFound();
    }

    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-zinc-950"><LoadingSpinner /><span className="ml-2">Loading Event...</span></div>}>
            <EventClientUI
                eventId={resolvedParams.id}
                initialEvent={data.initialEvent}
                eventPath={data.eventPath}
            />
        </Suspense>
    );
}