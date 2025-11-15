'use client';

import { useState, useEffect } from 'react';
import { db } from '@/app/lib/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { Announcement } from '@/app/lib/definitions';
import Announcements from '@/app/e/ui/Announcements';
import { useSearchParams, useParams } from 'next/navigation';
import { useEventContext } from './context';
import {
    ScheduledScreen,
    PausedScreen,
    CancelledScreen,
    EndedScreen
} from '@/app/e/ui/StatusScreens';

// Helper to normalize timestamps
function normalizeTimestamp(timestamp: unknown): { seconds: number; nanoseconds: number } {
    if (!timestamp) return { seconds: 0, nanoseconds: 0 };
    if (typeof timestamp === 'object' && timestamp !== null) {
        const ts = timestamp as Record<string, unknown>;
        if (typeof ts.seconds === 'number') {
            return { seconds: ts.seconds, nanoseconds: typeof ts.nanoseconds === 'number' ? ts.nanoseconds : 0 };
        }
        // Handle Firebase SDK objects that use _seconds
        const tsInternal = timestamp as { _seconds?: number; _nanoseconds?: number };
        if (typeof tsInternal._seconds === 'number') {
            return { seconds: tsInternal._seconds, nanoseconds: tsInternal._nanoseconds || 0 };
        }
    }
    return { seconds: 0, nanoseconds: 0 };
}

export default function AnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isFeedLoading, setIsFeedLoading] = useState(true);

    // Get event data from context
    const { eventPath, event } = useEventContext();

    const searchParams = useSearchParams();
    const params = useParams(); // To get the event ID for links
    const announcementIdFromUrl = searchParams.get('announcementId');

    useEffect(() => {
        if (!eventPath) return;

        const announcementsQuery = query(collection(db, `${eventPath}/announcements`), orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(announcementsQuery, (snapshot) => {
            const announcementsData = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: normalizeTimestamp(data.createdAt),
                } as Announcement;
            });
            setAnnouncements(announcementsData);
            setIsFeedLoading(false);
        }, (error) => {
            console.error("Error fetching announcements:", error);
            setIsFeedLoading(false);
        });

        return () => unsubscribe();
    }, [eventPath]);

    // --- VIEW LOGIC ---

    if (event.status === 'cancelled') {
        return <CancelledScreen />;
    }

    if (event.status === 'paused') {
        return <PausedScreen />;
    }

    if (event.status === 'ended') {
        return <EndedScreen announcements={announcements} />;
    }

    // For 'scheduled' and 'live', we render the main content
    return (
        <div className="space-y-8 animate-fade-in">
            {/* If Scheduled, stack the Hero Screen on top of the feed */}
            {event.status === 'scheduled' && (
                <ScheduledScreen event={event} eventId={params.id as string} />
            )}

            {/* If we have pre-event updates, show a small divider */}
            {event.status === 'scheduled' && announcements.length > 0 && (
                <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-gray-200 dark:border-zinc-800"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-slate-50 px-2 text-sm text-gray-400 dark:bg-zinc-950 dark:text-zinc-500">Pre-Event Updates</span>
                    </div>
                </div>
            )}

            <Announcements
                announcements={announcements}
                isLoading={isFeedLoading}
                announcementIdFromUrl={announcementIdFromUrl}
            />
        </div>
    );
}