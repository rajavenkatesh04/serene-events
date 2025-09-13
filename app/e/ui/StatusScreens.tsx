import { Event, Announcement } from '@/app/lib/definitions';
import { formatRelativeDate } from '@/app/lib/utils';
import { ClockIcon, PauseIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

function StatusScreenLayout({ icon: Icon, title, children }: { icon: React.ElementType, title: string, children: React.ReactNode }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300/80 bg-white/50 p-12 text-center dark:border-zinc-800/50 dark:bg-zinc-900/50">
            <Icon className="h-12 w-12 text-gray-400 dark:text-zinc-500" />
            <h2 className="mt-4 text-2xl font-semibold text-gray-900 dark:text-zinc-100">{title}</h2>
            <div className="mt-2 text-base text-gray-600 dark:text-zinc-400">
                {children}
            </div>
        </div>
    );
}

export function ScheduledScreen({ event }: { event: Event }) {
    const startsDate = new Date(event.startsAt.seconds * 1000);
    const formattedDate = new Intl.DateTimeFormat(undefined, {
        dateStyle: 'full',
        timeStyle: 'long',
    }).format(startsDate);

    return (
        <StatusScreenLayout icon={ClockIcon} title="Event Has Not Started Yet">
            <p>This event is scheduled to begin on:</p>
            <p className="mt-2 font-medium text-gray-800 dark:text-zinc-200">{formattedDate}</p>
            <p className="mt-4 text-sm">Please check back when the event goes live.</p>
        </StatusScreenLayout>
    );
}

export function PausedScreen() {
    return (
        <StatusScreenLayout icon={PauseIcon} title="Event is Temporarily Paused">
            <p>The event host has paused the live feed.</p>
            <p className="mt-1">Updates will resume shortly. Please stand by.</p>
        </StatusScreenLayout>
    );
}

export function EndedScreen({ announcements }: { announcements: Announcement[] }) {
    return (
        <StatusScreenLayout icon={CheckCircleIcon} title="This Event Has Ended">
            <p className="mb-6">Thank you for attending. You can review the final announcements below.</p>
            <div className="mt-4 w-full max-w-md text-left border-t border-gray-200 dark:border-zinc-700 pt-4 space-y-4">
                {announcements.length > 0 ? announcements.map(ann => (
                    <div key={ann.id} className="pb-2">
                        <p className="font-semibold text-gray-800 dark:text-zinc-200">{ann.title}</p>
                        <p className="text-sm">{ann.content}</p>
                        <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">{formatRelativeDate(ann.createdAt)}</p>
                    </div>
                )) : <p className="text-center text-sm">No final announcements were posted.</p>}
            </div>
        </StatusScreenLayout>
    );
}

export function CancelledScreen() {
    return (
        <StatusScreenLayout icon={XCircleIcon} title="This Event Has Been Cancelled">
            <p>We apologize for any inconvenience.</p>
            <p className="mt-1">Please contact the event organizer for more information.</p>
        </StatusScreenLayout>
    );
}