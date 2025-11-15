'use client';

import { useState, useEffect } from 'react';
import { Event, Announcement } from '@/app/lib/definitions';
import { ClockIcon, PauseIcon, CheckCircleIcon, XCircleIcon, CalendarDaysIcon, MapPinIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';
import { CompactAnnouncementCard } from '@/app/e/ui/Announcements';
import Link from 'next/link';

// --- LAYOUT HELPERS ---

type AccentColor = 'blue' | 'amber' | 'teal' | 'rose' | 'default';

const accentConfig = {
    blue: { icon: 'text-blue-500', border: 'border-blue-300/80 dark:border-blue-800/50' },
    amber: { icon: 'text-amber-500', border: 'border-amber-300/80 dark:border-amber-800/50' },
    teal: { icon: 'text-teal-500', border: 'border-teal-300/80 dark:border-teal-800/50' },
    rose: { icon: 'text-rose-500', border: 'border-rose-300/80 dark:border-rose-800/50' },
    default: { icon: 'text-gray-400 dark:text-zinc-500', border: 'border-gray-300/80 dark:border-zinc-800/50' }
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

// --- COUNTDOWN COMPONENT ---

function CountdownDisplay({ targetDate }: { targetDate: Date }) {
    const calculateTimeLeft = () => {
        const difference = +targetDate - +new Date();
        if (difference <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
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
                    <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">{String(value).padStart(2, '0')}</span>
                    <span className="text-xs uppercase text-gray-500 dark:text-zinc-500">{unit}</span>
                </div>
            ))}
        </div>
    );
}

// --- 1. SCHEDULED SCREEN (UPDATED) ---

export function ScheduledScreen({ event, eventId }: { event: Event, eventId: string }) {
    const startsDate = new Date(event.startsAt.seconds * 1000);
    const now = new Date();

    // Google Calendar Link Logic
    const formattedStartDate = startsDate.toISOString().replace(/-|:|\.\d\d\d/g, "");
    let formattedEndDate = formattedStartDate;
    if (event.endsAt) {
        formattedEndDate = new Date(event.endsAt.seconds * 1000).toISOString().replace(/-|:|\.\d\d\d/g, "");
    }
    const calendarLink = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${formattedStartDate}/${formattedEndDate}&details=${encodeURIComponent(event.description || '')}&location=${encodeURIComponent(event.locationText)}`;

    if (now >= startsDate) {
        // Simple delay message if start time passed but status isn't live yet
        return (
            <StatusScreenLayout icon={ClockIcon} title="Starting Soon" accent="amber">
                <p>We are wrapping up final preparations.</p>
                <p className="mt-1 text-sm text-gray-500">The feed will go live momentarily.</p>
            </StatusScreenLayout>
        );
    }

    return (
        <StatusScreenLayout icon={ClockIcon} title="Event Begins Soon" accent="blue">
            <p>The live feed hasn&apos;t started yet.</p>
            <CountdownDisplay targetDate={startsDate} />

            {/* NEW: Action Buttons */}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
                <a href={calendarLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-500">
                    <CalendarDaysIcon className="h-5 w-5" />
                    Add to Calendar
                </a>
                <Link href={`/e/${eventId}/locations`} className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700">
                    <MapPinIcon className="h-5 w-5" />
                    View Locations
                </Link>
                <Link href={`/e/${eventId}/feedback`} className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700">
                    <ChatBubbleBottomCenterTextIcon className="h-5 w-5" />
                    Feedback
                </Link>
            </div>

            <div className="mt-8 border-t border-gray-200/50 pt-4 dark:border-zinc-800/50">
                <p className="text-sm text-gray-500">Updates will appear below as they happen.</p>
            </div>
        </StatusScreenLayout>
    );
}

// --- 2. PAUSED SCREEN ---

export function PausedScreen() {
    useEffect(() => {
        const interval = setInterval(() => window.location.reload(), 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <StatusScreenLayout icon={PauseIcon} title="Event is Paused" accent="amber">
            <p>The event host has paused the live feed.</p>
            <p className="mt-1">Updates will resume shortly. This page will refresh automatically.</p>
        </StatusScreenLayout>
    );
}

// --- 3. ENDED SCREEN ---

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
        <StatusScreenLayout icon={CheckCircleIcon} title="Event Has Ended" accent="teal">
            <p className="mb-6">Thank you for attending. You can review the announcements archive below.</p>
            <div className="mt-4 w-full max-w-2xl space-y-4 border-t border-teal-200 pt-6 text-left dark:border-teal-700/50">
                {announcements.length > 0 ? announcements.map(ann => (
                    <CompactAnnouncementCard
                        key={ann.id}
                        announcement={ann}
                        isRecent={false}
                        isExpanded={expandedCards.has(ann.id)}
                        onToggleExpanded={() => handleToggleExpanded(ann.id)}
                    />
                )) : <p className="text-center text-sm text-gray-500">No announcements were posted.</p>}
            </div>
        </StatusScreenLayout>
    );
}

// --- 4. CANCELLED SCREEN ---

export function CancelledScreen() {
    return (
        <StatusScreenLayout icon={XCircleIcon} title="Event Cancelled" accent="rose">
            <p>We apologize for the inconvenience.</p>
            <p className="mt-1">Please contact the organizer for more information.</p>
        </StatusScreenLayout>
    );
}