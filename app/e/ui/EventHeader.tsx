'use client';

import { useState } from 'react';
import { Event } from '@/app/lib/definitions';
import { MapPinIcon, ChevronDownIcon, ChevronUpIcon, CalendarIcon } from '@heroicons/react/24/outline';
import StatusBadge from './StatusBadge';
import InteractiveQrCode from '@/app/ui/dashboard/events/InteractiveQrCode';
import NotificationButton from '@/app/ui/NotificationButton';
import { motion, AnimatePresence } from 'framer-motion';

// This component presents the full date and time with corrected colors for light/dark modes.
function DateTimeBlock({ label, date }: { label: string; date: Date }) {
    const fullDate = date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const timeOnly = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', timeZoneName: 'long' });

    return (
        <div className="text-center sm:text-left">
            {/* --- COLOR FIX --- */}
            <p className="text-sm font-semibold text-gray-500 dark:text-zinc-400">{label}</p>
            <p className="mt-1 text-lg font-bold text-gray-900 dark:text-zinc-100">{timeOnly}</p>
            <p className="text-xs text-gray-500 dark:text-zinc-400">{fullDate}</p>
        </div>
    );
}

export default function EventHeader({ event, eventId }: { event: Event, eventId: string }) {
    const [isExpanded, setIsExpanded] = useState(typeof window !== 'undefined' && window.innerWidth >= 768);
    const startsDate = new Date(event.startsAt.seconds * 1000);
    const endsDate = new Date(event.endsAt.seconds * 1000);

    return (
        <div className="mb-12 rounded-2xl bg-white ring-1 ring-black/5 dark:bg-zinc-900 dark:ring-white/10">
            {/* --- Part 1: The Ultra-Minimalist "Cover" --- */}
            <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-100 sm:text-4xl">{event.title}</h1>
                    <StatusBadge status={event.status} />
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-500 dark:text-zinc-400">
                    <MapPinIcon className="h-4 w-4" />
                    <span>{event.locationText}</span>
                </div>
            </div>

            {/* --- Part 2: The "Unfolding" Content --- */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        key="details"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: 'easeInOut' }}
                    >
                        <div className="border-t border-gray-200 dark:border-zinc-800 p-6 sm:p-8">
                            <div>
                                <h2 className="text-sm font-semibold text-gray-500 dark:text-zinc-400">About this Event</h2>
                                <p className="mt-2 text-base text-gray-700 dark:text-zinc-300">{event.description || 'No description provided.'}</p>
                                <div className="mt-6">
                                    <NotificationButton eventId={eventId} />
                                </div>
                            </div>

                            {/* --- LAYOUT FIX: Re-introduced the horizontal time display --- */}
                            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-zinc-800">
                                <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
                                    <DateTimeBlock label="Starts" date={startsDate} />
                                    <div className="w-full flex-1 items-center gap-2 sm:flex">
                                        <div className="h-px w-full flex-1 border-t-2 border-dashed border-gray-200 dark:border-zinc-700"></div>
                                        <CalendarIcon className="hidden h-6 w-6 text-gray-300 dark:text-zinc-600 sm:block" />
                                        <div className="h-px w-full flex-1 border-t-2 border-dashed border-gray-200 dark:border-zinc-700"></div>
                                    </div>
                                    <DateTimeBlock label="Ends" date={endsDate} />
                                </div>
                            </div>

                        </div>
                        {/* --- "Stub" Section for QR Code --- */}
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

            {/* --- The Toggle Button (hidden on desktop) --- */}
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