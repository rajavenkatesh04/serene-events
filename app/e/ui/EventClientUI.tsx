'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import clsx from 'clsx';
import { db } from '@/app/lib/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { Announcement, Event } from '@/app/lib/definitions';
import { Toaster } from 'react-hot-toast';

import Navbar from './Navbar';
import EventHeader from './EventHeader';
import Announcements from './Announcements';
import { ScheduledScreen, PausedScreen, EndedScreen, CancelledScreen } from './StatusScreens';
import { SparklesIcon } from '@heroicons/react/24/outline';

// This utility normalizes timestamps from different Firestore sources
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


export default function EventClientUI({ eventId, initialEvent, eventPath }: {
    eventId: string;
    initialEvent: Event;
    eventPath: string;
}) {
    const searchParams = useSearchParams();
    const activeTab = searchParams.get('tab') || 'announcements';
    const [event] = useState(initialEvent);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isFeedLoading, setIsFeedLoading] = useState(true);

    useEffect(() => {
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

    // This is a placeholder for your Chat and Engage pages
    const EventChatPage = () => <div className="text-center p-8 rounded-lg border-2 border-dashed">Chat Feature Coming Soon</div>;
    const EngagePage = () => <div className="text-center p-8 rounded-lg border-2 border-dashed">Engage Feature Coming Soon</div>;


    return (
        <div className="bg-slate-50 text-slate-800 dark:bg-zinc-950 dark:text-slate-200">
            <Toaster position="top-center" reverseOrder={false} />
            <Navbar />

            <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                <EventHeader event={event} eventId={eventId} />

                <main>
                    {event.status !== 'live' ? (
                        <>
                            {event.status === 'scheduled' && <ScheduledScreen event={event} />}
                            {event.status === 'paused' && <PausedScreen />}
                            {event.status === 'ended' && <EndedScreen announcements={announcements} />}
                            {event.status === 'cancelled' && <CancelledScreen />}
                        </>
                    ) : (
                        <>
                            <div className="w-full border-b border-gray-200 dark:border-zinc-800">
                                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                                    <Link
                                        href={`/e/${eventId}`}
                                        className={clsx("whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium", {
                                            'border-indigo-500 text-indigo-600 dark:text-indigo-400': activeTab === 'announcements',
                                            'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-300': activeTab !== 'announcements'
                                        })}
                                    >
                                        Announcements
                                    </Link>
                                    <Link
                                        href={`/e/${eventId}?tab=chat`}
                                        className={clsx("whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium", {
                                            'border-indigo-500 text-indigo-600 dark:text-indigo-400': activeTab === 'chat',
                                            'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-300': activeTab !== 'chat'
                                        })}
                                    >
                                        Chat
                                    </Link>
                                    <Link
                                        href={`/e/${eventId}?tab=engage`}
                                        className={clsx("whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium", {
                                            'border-indigo-500 text-indigo-600 dark:text-indigo-400': activeTab === 'engage',
                                            'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-300': activeTab !== 'engage'
                                        })}
                                    >
                                        Engage
                                    </Link>
                                </nav>
                            </div>

                            <div className="py-6">
                                {activeTab === 'announcements' && (
                                    <Announcements
                                        announcements={announcements}
                                        isLoading={isFeedLoading}
                                    />
                                )}
                                {activeTab === 'chat' && <EventChatPage />}
                                {activeTab === 'engage' && <EngagePage />}
                            </div>
                        </>
                    )}
                </main>
            </div>

            <footer className="w-full border-t border-gray-200/80 bg-slate-100/50 py-6 dark:border-zinc-800/50 dark:bg-zinc-950/50">
                <div className="mx-auto flex max-w-6xl items-center justify-center px-6 text-sm text-gray-500 dark:text-zinc-500">
                    <a href="https://luna-83jo.vercel.app/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                        <SparklesIcon className="h-4 w-4 text-indigo-500" />
                        <span>Powered by <span className="font-medium text-gray-700 dark:text-zinc-300">Luna</span></span>
                    </a>
                </div>
            </footer>
        </div>
    );
}