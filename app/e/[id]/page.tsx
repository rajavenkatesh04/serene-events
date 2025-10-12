'use client';

import { useState, useEffect } from 'react';
import { db } from '@/app/lib/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { Announcement } from '@/app/lib/definitions';
import Announcements from '@/app/e/ui/Announcements';
import { useSearchParams } from 'next/navigation';
import { useEventContext } from './context';

// Helper to normalize timestamps from Firestore's real-time listener
function normalizeTimestamp(timestamp: unknown): { seconds: number; nanoseconds: number } {
    if (!timestamp) return { seconds: 0, nanoseconds: 0 };

    // Handle Firestore Timestamp objects
    if (typeof timestamp === 'object' && timestamp !== null) {
        const ts = timestamp as Record<string, unknown>;
        if (typeof ts.seconds === 'number') {
            return {
                seconds: ts.seconds,
                nanoseconds: typeof ts.nanoseconds === 'number' ? ts.nanoseconds : 0
            };
        }
        if (typeof ts._seconds === 'number') {
            return {
                seconds: ts._seconds,
                nanoseconds: typeof ts._nanoseconds === 'number' ? ts._nanoseconds : 0
            };
        }
    }

    return { seconds: 0, nanoseconds: 0 };
}

export default function AnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isFeedLoading, setIsFeedLoading] = useState(true);

    // Use the context to get the eventPath provided by the server layout
    const { eventPath } = useEventContext();

    //Get the search params
    const searchParams = useSearchParams();
    const announcementIdFromUrl = searchParams.get('announcementId');

    useEffect(() => {
        if (!eventPath) return;

        // The listener now has the correct, full path from the context!
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
            console.error("Error fetching announcements in real-time:", error);
            setIsFeedLoading(false);
        });

        return () => unsubscribe();
    }, [eventPath]);

    return (
        <Announcements
            announcements={announcements}
            isLoading={isFeedLoading}
            announcementIdFromUrl={announcementIdFromUrl}
        />
    );
}