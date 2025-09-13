'use client';

import { useState, useEffect } from 'react';
import { Event, Announcement } from '@/app/lib/definitions';
import { ClockIcon, PauseIcon, CheckCircleIcon, XCircleIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
// We are reusing the full-featured announcement card from your Announcements component.
// NOTE: For this to work, you must export `CompactAnnouncementCard` from your `Announcements.tsx` file.
import { CompactAnnouncementCard } from '@/app/e/ui/Announcements';

// This is the shared layout for all status screens.
function StatusScreenLayout({ icon: Icon, title, children }: { icon: React.ElementType, title: string, children: React.ReactNode }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300/80 bg-white/50 p-8 text-center dark:border-zinc-800/50 dark:bg-zinc-900/50 sm:p-12">
            <Icon className="h-12 w-12 text-gray-400 dark:text-zinc-500" />
            <h2 className="mt-4 text-2xl font-semibold text-gray-900 dark:text-zinc-100">{title}</h2>
            <div className="mt-2 w-full text-base text-gray-600 dark:text-zinc-400">
                {children}
            </div>
        </div>
    );
}

// --- 1. SCHEDULED SCREEN (with Countdown) ---

function CountdownDisplay({ targetDate }: { targetDate: Date }) {
    const calculateTimeLeft = () => {
        const difference = +targetDate - +new Date();
        let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        } else {
            // If the countdown is over, refresh the page to show the live event
            if (typeof window !== 'undefined') {
                window.location.reload();
            }
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    return (
        <div className="mt-6 flex justify-center gap-4">
            {Object.entries(timeLeft).map(([unit, value]) => (
                <div key={unit} className="flex w-20 flex-col items-center rounded-lg bg-gray-100 p-2 dark:bg-zinc-800">
                    <span className="text-3xl font-bold text-gray-800 dark:text-zinc-200">{String(value).padStart(2, '0')}</span>
                    <span className="text-xs uppercase text-gray-500 dark:text-zinc-500">{unit}</span>
                </div>
            ))}
        </div>
    );
}

export function ScheduledScreen({ event }: { event: Event }) {
    const startsDate = new Date(event.startsAt.seconds * 1000);

    const calendarLink = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startsDate.toISOString().replace(/-|:|\.\d\d\d/g,"")}/${new Date(event.endsAt.seconds * 1000).toISOString().replace(/-|:|\.\d\d\d/g,"")}&details=${encodeURIComponent(event.description || '')}&location=${encodeURIComponent(event.locationText)}`;

    return (
        <StatusScreenLayout icon={ClockIcon} title="Event Begins Soon">
            <p>This event is scheduled to go live in:</p>
            <CountdownDisplay targetDate={startsDate} />
            <a
                href={calendarLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-500"
            >
                <CalendarDaysIcon className="h-5 w-5" />
                Add to Calendar
            </a>
        </StatusScreenLayout>
    );
}

// --- 2. PAUSED SCREEN ---

export function PausedScreen() {
    // This effect will try to reload the page every 30 seconds to check if the event is live again.
    useEffect(() => {
        const interval = setInterval(() => {
            window.location.reload();
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <StatusScreenLayout icon={PauseIcon} title="Event is Temporarily Paused">
            <p>The event host has paused the live feed.</p>
            <p className="mt-1">Updates will resume shortly. This page will refresh automatically.</p>
        </StatusScreenLayout>
    );
}

// --- 3. ENDED SCREEN (with Rich Content) ---

export function EndedScreen({ announcements }: { announcements: Announcement[] }) {
    const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

    const handleToggleExpanded = (announcementId: string) => {
        setExpandedCards(prev => {
            const newSet = new Set(prev);
            newSet.has(announcementId) ? newSet.delete(announcementId) : newSet.add(announcementId);
            return newSet;
        });
    };

    return (
        <StatusScreenLayout icon={CheckCircleIcon} title="This Event Has Ended">
            <p className="mb-6">Thank you for attending. You can review the announcements archive from the event below.</p>
            <div className="mt-4 w-full max-w-2xl text-left border-t border-gray-200 dark:border-zinc-700 pt-6 space-y-4">
                {announcements.length > 0 ? announcements.map(ann => (
                    <CompactAnnouncementCard
                        key={ann.id}
                        announcement={ann}
                        isRecent={false}
                        isExpanded={expandedCards.has(ann.id)}
                        onToggleExpanded={() => handleToggleExpanded(ann.id)}
                    />
                )) : <p className="text-center text-sm text-gray-500 dark:text-zinc-500">No announcements were posted during this event.</p>}
            </div>
        </StatusScreenLayout>
    );
}

// --- 4. CANCELLED SCREEN ---

export function CancelledScreen() {
    return (
        <StatusScreenLayout icon={XCircleIcon} title="This Event Has Been Cancelled">
            <p>We apologize for any inconvenience this may have caused.</p>
            <p className="mt-1">Please contact the event organizer for more information.</p>
        </StatusScreenLayout>
    );
}