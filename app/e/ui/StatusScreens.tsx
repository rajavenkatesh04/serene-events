'use client';

import { useState, useEffect } from 'react';
import { Event, Announcement } from '@/app/lib/definitions';
import { ClockIcon, PauseIcon, CheckCircleIcon, XCircleIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { CompactAnnouncementCard } from '@/app/e/ui/Announcements';
import LoadingSpinner from '@/app/ui/dashboard/loading-spinner';

// --- UPDATED LAYOUT WITH ACCENT COLORS ---

type AccentColor = 'blue' | 'amber' | 'teal' | 'rose' | 'default';

// Color configuration based on the StatusBadge component
const accentConfig = {
    blue: {
        icon: 'text-blue-500',
        border: 'border-blue-300/80 dark:border-blue-800/50',
    },
    amber: {
        icon: 'text-amber-500',
        border: 'border-amber-300/80 dark:border-amber-800/50',
    },
    teal: {
        icon: 'text-teal-500',
        border: 'border-teal-300/80 dark:border-teal-800/50',
    },
    rose: {
        icon: 'text-rose-500',
        border: 'border-rose-300/80 dark:border-rose-800/50',
    },
    default: {
        icon: 'text-gray-400 dark:text-zinc-500',
        border: 'border-gray-300/80 dark:border-zinc-800/50',
    }
};

function StatusScreenLayout({ icon: Icon, title, children, accent = 'default' }: { icon: React.ElementType, title: string, children: React.ReactNode, accent?: AccentColor }) {
    const colors = accentConfig[accent] || accentConfig.default;

    return (
        <div className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-white/50 p-8 text-center dark:bg-zinc-900/50 sm:p-12 ${colors.border}`}>
            <Icon className={`h-12 w-12 ${colors.icon}`} />
            <h2 className="mt-4 text-2xl font-semibold text-gray-900 dark:text-zinc-100">{title}</h2>
            <div className="mt-2 w-full text-base text-gray-600 dark:text-zinc-400">
                {children}
            </div>
        </div>
    );
}

// --- 1. UPGRADED SCHEDULED SCREEN ---

function CountdownDisplay({ targetDate }: { targetDate: Date }) {
    const calculateTimeLeft = () => {
        const difference = +targetDate - +new Date();
        if (difference <= 0) {
            if (typeof window !== 'undefined') {
                window.location.reload();
            }
            return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }
        return {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
        };
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
        return () => clearInterval(timer);
    }, [targetDate]);

    return (
        <div className="mt-6 flex justify-center gap-4">
            {Object.entries(timeLeft).map(([unit, value]) => (
                <div key={unit} className="flex w-20 flex-col items-center rounded-lg bg-gray-100 p-2 dark:bg-zinc-800">
                    {/* Added blue accent to countdown numbers */}
                    <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">{String(value).padStart(2, '0')}</span>
                    <span className="text-xs uppercase text-gray-500 dark:text-zinc-500">{unit}</span>
                </div>
            ))}
        </div>
    );
}

export function ScheduledScreen({ event }: { event: Event }) {
    const startsDate = new Date(event.startsAt.seconds * 1000);
    const now = new Date();
    const isPastStartTime = now >= startsDate;

    if (isPastStartTime) {
        return <DelayedScreen />;
    }

    const calendarLink = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startsDate.toISOString().replace(/-|:|\.\d\d\d/g,"")}/${new Date(event.endsAt.seconds * 1000).toISOString().replace(/-|:|\.\d\d\d/g,"")}&details=${encodeURIComponent(event.description || '')}&location=${encodeURIComponent(event.locationText)}`;

    return (
        <StatusScreenLayout icon={ClockIcon} title="Event Begins Soon" accent="blue">
            <p>This event is scheduled to go live in:</p>
            <CountdownDisplay targetDate={startsDate} />
            {/* Changed button color to blue for consistency */}
            <a href={calendarLink} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                <CalendarDaysIcon className="h-5 w-5" />
                Add to Calendar
            </a>
        </StatusScreenLayout>
    );
}


// --- 2. PAUSED & DELAYED SCREENS (AMBER ACCENT) ---

function DelayedScreen() {
    useEffect(() => {
        const interval = setInterval(() => {
            window.location.reload();
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <StatusScreenLayout icon={ClockIcon} title="Event is Delayed" accent="amber">
            <div className="flex flex-col items-center">
                <p className="mt-4">The event was scheduled to start, but seems to be delayed.</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-zinc-500">Please hang tight. This page will refresh automatically.</p>
            </div>
        </StatusScreenLayout>
    );
}

export function PausedScreen() {
    useEffect(() => {
        const interval = setInterval(() => {
            window.location.reload();
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <StatusScreenLayout icon={PauseIcon} title="Event is Temporarily Paused" accent="amber">
            <p>The event host has paused the live feed.</p>
            <p className="mt-1">Updates will resume shortly. This page will refresh automatically.</p>
        </StatusScreenLayout>
    );
}

// --- 3. ENDED SCREEN (TEAL ACCENT) ---

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
        <StatusScreenLayout icon={CheckCircleIcon} title="This Event Has Ended" accent="teal">
            <p className="mb-6">Thank you for attending. You can review the announcements archive below.</p>
            {/* Added teal accent to the divider */}
            <div className="mt-4 w-full max-w-2xl space-y-4 border-t border-teal-200 pt-6 text-left dark:border-teal-700/50">
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

// --- 4. CANCELLED SCREEN (ROSE ACCENT) ---

export function CancelledScreen() {
    return (
        <StatusScreenLayout icon={XCircleIcon} title="This Event Has Been Cancelled" accent="rose">
            <p>We apologize for any inconvenience this may have caused.</p>
            <p className="mt-1">Please contact the event organizer for more information.</p>
        </StatusScreenLayout>
    );
}