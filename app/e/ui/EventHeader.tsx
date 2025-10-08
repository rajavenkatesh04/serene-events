'use client';

import { useState, useEffect } from 'react';
import { Event } from '@/app/lib/definitions';
import { MapPinIcon, ChevronDownIcon, ChevronUpIcon, ClockIcon } from '@heroicons/react/24/outline';
import StatusBadge from './StatusBadge';
import InteractiveQrCode from '@/app/ui/dashboard/events/InteractiveQrCode';
import NotificationButton from '@/app/ui/NotificationButton';
import { motion, AnimatePresence } from 'framer-motion';

// --- HELPER FUNCTION (Unchanged) ---
function getEventDuration(start: Date, end: Date): string {
    const durationMs = end.getTime() - start.getTime();
    const minutes = Math.floor((durationMs / (1000 * 60)) % 60);
    const hours = Math.floor((durationMs / (1000 * 60 * 60)) % 24);
    const days = Math.floor(durationMs / (1000 * 60 * 60 * 24));

    if (days > 1) return `A ${days}-day event`;
    if (days === 1) return `A 1-day event`;
    if (hours > 0) return `Lasts ${hours}h ${minutes > 0 ? `${minutes}m` : ''}`.trim();
    if (minutes > 0) return `Lasts ${minutes} minutes`;
    return '';
}

// --- DateTimeDisplay Component (Unchanged) ---
function DateTimeDisplay({ startsAt, endsAt }: { startsAt: Date | null, endsAt: Date | null }) {
    if (startsAt && endsAt) {
        const isSameDay = startsAt.toLocaleDateString() === endsAt.toLocaleDateString();
        const duration = getEventDuration(startsAt, endsAt);
        const timeOptions: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
        const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const timeZoneName = new Intl.DateTimeFormat(undefined, { timeZoneName: 'long' }).formatToParts(startsAt).find(part => part.type === 'timeZoneName')?.value;

        if (isSameDay) {
            return (
                <div className="text-center">
                    <p className="text-lg font-bold text-gray-900 dark:text-zinc-100">{startsAt.toLocaleDateString(undefined, dateOptions)}</p>
                    <p className="mt-2 text-2xl font-medium text-blue-600 dark:text-blue-400">
                        {`${startsAt.toLocaleTimeString(undefined, timeOptions)} - ${endsAt.toLocaleTimeString(undefined, timeOptions)}`}
                    </p>
                    <div className="mt-2 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-zinc-400">
                        <ClockIcon className="h-4 w-4" />
                        <span>{duration}</span>
                        <span className="font-semibold text-gray-400 dark:text-zinc-600">•</span>
                        <span>{timeZoneName}</span>
                    </div>
                </div>
            );
        }
        const fullOptions: Intl.DateTimeFormatOptions = { ...dateOptions, ...timeOptions, timeZoneName: 'short' };
        return (
            <div className="flex w-full flex-col items-center justify-between gap-4 sm:flex-row">
                <div className="text-center sm:text-left">
                    <p className="text-sm font-semibold text-gray-500 dark:text-zinc-400">Starts</p>
                    <p className="mt-1 text-lg font-bold text-gray-900 dark:text-zinc-100">{startsAt.toLocaleString(undefined, fullOptions)}</p>
                </div>
                <div className="text-center sm:text-right">
                    <p className="text-sm font-semibold text-gray-500 dark:text-zinc-400">Ends</p>
                    <p className="mt-1 text-lg font-bold text-gray-900 dark:text-zinc-100">{endsAt.toLocaleString(undefined, fullOptions)}</p>
                </div>
            </div>
        );
    }
    if (startsAt) {
        const timeOptions: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
        const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return (
            <div className="text-center">
                <p className="text-lg font-bold text-gray-900 dark:text-zinc-100">{startsAt.toLocaleDateString(undefined, dateOptions)}</p>
                <p className="mt-2 text-2xl font-medium text-blue-600 dark:text-blue-400">
                    From {startsAt.toLocaleTimeString(undefined, timeOptions)} onwards
                </p>
            </div>
        );
    }
    return (
        <div className="text-center text-base text-gray-500 dark:text-zinc-400">
            <p>Date & Time to be announced</p>
        </div>
    );
}

export default function EventHeader({ event, eventId }: { event: Event, eventId: string }) {
    const [isExpanded, setIsExpanded] = useState(true);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
            setIsExpanded(false);
        }
    }, []);

    const startsDate = event.startsAt ? new Date(event.startsAt.seconds * 1000) : null;
    const endsDate = event.endsAt ? new Date(event.endsAt.seconds * 1000) : null;

    return (
        <div className="mb-12 rounded-2xl bg-white ring-1 ring-black/5 dark:bg-zinc-900 dark:ring-white/10">
            <div className="p-6">
                {/* ✨ FIX 1: Improved layout for title and status badge */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-100 sm:text-4xl">
                        {event.title}
                    </h1>
                    <div className="mt-3 sm:mt-0 flex-shrink-0">
                        <StatusBadge status={event.status} />
                    </div>
                </div>

                {event.locationText && (
                    <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-500 dark:text-zinc-400">
                        <MapPinIcon className="h-4 w-4" />
                        <span>{event.locationText}</span>
                    </div>
                )}

                {/* ✨ FIX 2: Notification button moved here to be always visible */}
                <div className="mt-6">
                    <NotificationButton eventId={eventId} />
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        key="details"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1, transition: { duration: 0.4, ease: 'easeInOut' } }}
                        exit={{ height: 0, opacity: 0, transition: { duration: 0.3, ease: 'easeInOut' } }}
                        className="overflow-hidden"
                    >
                        <div className="border-t border-gray-200 dark:border-zinc-800 p-6 sm:p-8">
                            <div>
                                <h2 className="text-sm font-semibold text-gray-500 dark:text-zinc-400">About this Event</h2>
                                <p className="mt-2 text-base text-gray-700 dark:text-zinc-300">{event.description || 'No description provided.'}</p>
                                {/* The notification button was moved from here */}
                            </div>
                            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-zinc-800">
                                <DateTimeDisplay startsAt={startsDate} endsAt={endsDate} />
                            </div>
                        </div>
                        <div className="relative border-t-2 border-dashed border-gray-200 bg-gray-50/50 p-6 dark:border-zinc-700 dark:bg-zinc-800/20">
                            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
                                <div className="flex-shrink-0">
                                    <InteractiveQrCode eventId={event.id} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800 dark:text-zinc-200">Share This Event</h3>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">Scan or click the QR code to easily share, download, or copy the event link.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={() => setIsExpanded(!isExpanded)}
                aria-expanded={isExpanded}
                className="flex w-full items-center justify-center gap-2 border-t border-gray-200/80 px-6 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-zinc-800/50 dark:text-zinc-300 dark:hover:bg-zinc-800/50 md:hidden"
            >
                <span>{isExpanded ? 'Hide Details' : 'View Event Details'}</span>
                {isExpanded ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
            </button>
        </div>
    );
}