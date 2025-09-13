import { Event } from '@/app/lib/definitions';
import { MapPinIcon, UsersIcon, UserCircleIcon, CalendarIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import InteractiveQrCode from './InteractiveQrCode'; // Assuming InteractiveQrCode.tsx is in the same folder
import StatusBadge from './StatusBadge'; // Assuming StatusBadge.tsx is in the same folder

// --- REDESIGNED DateTimeBlock for better readability ---
function DateTimeBlock({ label, date }: { label: string; date: Date }) {
    // Format the date part (e.g., "11 Aug 2025")
    const displayDate = date.toLocaleDateString(undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });

    // Format the time part (e.g., "6:00 PM")
    const displayTime = date.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });

    // This is the magic: we robustly extract the FULL timezone name
    // e.g., "India Standard Time" instead of "GMT+5:30"
    const timeZoneName = new Intl.DateTimeFormat(undefined, { timeZoneName: 'long' })
        .formatToParts(date)
        .find(part => part.type === 'timeZoneName')
        ?.value;

    return (
        <div className="flex flex-col text-center sm:text-left">
            <p className="text-sm font-semibold text-gray-500 dark:text-zinc-400">{label}</p>
            <p className="text-xl font-bold text-gray-900 dark:text-zinc-100">
                {displayDate}
            </p>
            {/* The main time is now larger and more prominent */}
            <p className="mt-1 text-2xl font-medium text-blue-600 dark:text-blue-400 leading-tight">
                {displayTime}
            </p>
            {/* The full timezone name is smaller and acts as helpful context */}
            {timeZoneName && (
                <p className="text-xs text-gray-400 dark:text-zinc-500">
                    {timeZoneName}
                </p>
            )}
        </div>
    );
}


type EventHeaderProps = {
    event: Event;
    subscriberCount: number;
    adminCount: number;
}

export default function EventHeader({ event, subscriberCount, adminCount }: EventHeaderProps) {
    const startsDate = new Date(event.startsAt.seconds * 1000);
    const endsDate = new Date(event.endsAt.seconds * 1000);

    return (
        <div className="relative mb-8 mt-4 flex flex-col overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/5 dark:bg-zinc-900 dark:ring-white/10 lg:flex-row">
            {/* Main Info Section */}
            <div className="flex-grow p-6 sm:p-8">
                <div className="flex items-start justify-between">
                    <StatusBadge status={event.status} />
                    <div className="hidden items-center gap-1.5 text-sm text-gray-500 dark:text-zinc-400 sm:flex">
                        <MapPinIcon className="h-4 w-4" />
                        <span>{event.locationText}</span>
                    </div>
                </div>
                <div className="my-6">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-zinc-100 sm:text-5xl">{event.title}</h1>
                    <p className="mt-3 max-w-2xl text-base text-gray-600 dark:text-zinc-400">{event.description}</p>
                </div>

                <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
                    <DateTimeBlock label="Starts" date={startsDate} />

                    <div className="w-full flex-1 items-center gap-2 sm:flex">
                        <div className="h-px w-full flex-1 border-t-2 border-dashed border-gray-200 dark:border-zinc-700"></div>
                        <CalendarIcon className="hidden h-6 w-6 text-gray-300 dark:text-zinc-600 sm:block" />
                        <div className="h-px w-full flex-1 border-t-2 border-dashed border-gray-200 dark:border-zinc-700"></div>
                    </div>

                    <DateTimeBlock label="Ends" date={endsDate} />
                </div>
            </div>

            {/* "Stub" Section for Actions & Stats */}
            <div className="relative flex w-full flex-shrink-0 flex-col border-t-2 border-dashed border-gray-200 bg-gray-50/80 p-6 dark:border-zinc-700 dark:bg-zinc-800/50 lg:w-64 lg:border-l-2 lg:border-t-0">
                <div className="absolute -top-3 left-1/3 h-6 w-6 rounded-full bg-gray-100 dark:bg-zinc-950 lg:-left-3 lg:top-1/3 lg:left-auto lg:-top-auto"></div>
                <div className="absolute -top-3 left-2/3 h-6 w-6 rounded-full bg-gray-100 dark:bg-zinc-950 lg:-left-3 lg:top-2/3 lg:left-auto lg:-top-auto"></div>

                <div className="flex justify-around text-sm">
                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-zinc-300"><UsersIcon className="h-5 w-5" /><span className="font-semibold">{subscriberCount}</span></div>
                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-zinc-300"><UserCircleIcon className="h-5 w-5" /><span className="font-semibold">{adminCount}</span></div>
                </div>
                <div className="flex flex-grow items-center justify-center py-6 lg:py-0">
                    <InteractiveQrCode eventId={event.id} />
                </div>
                <Link href={`/e/${event.id}`} target="_blank" className="group mt-auto flex items-center justify-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                    <span>View Public Page</span><span aria-hidden="true" className="transition-transform group-hover:translate-x-1">&rarr;</span>
                </Link>
            </div>
        </div>
    );
}