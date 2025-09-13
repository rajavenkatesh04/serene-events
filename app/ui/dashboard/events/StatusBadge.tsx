import { Event } from '@/app/lib/definitions';
import { CalendarDaysIcon, SignalIcon, PauseCircleIcon, CheckBadgeIcon, XCircleIcon } from '@heroicons/react/20/solid';

export default function StatusBadge({ status }: { status: Event['status'] }) {
    const statusConfig = {
        scheduled: {
            text: 'Scheduled',
            icon: CalendarDaysIcon,
            className: 'bg-blue-100/80 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 ring-blue-600/20 dark:ring-blue-500/20'
        },
        live: {
            text: 'Live',
            icon: SignalIcon,
            className: 'bg-emerald-100/80 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 ring-emerald-600/20 dark:ring-emerald-500/20 animate-pulse'
        },
        paused: {
            text: 'Paused',
            icon: PauseCircleIcon,
            className: 'bg-amber-100/80 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 ring-amber-600/20 dark:ring-amber-500/20'
        },
        ended: {
            text: 'Ended',
            icon: CheckBadgeIcon,
            className: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 ring-slate-500/20 dark:ring-slate-500/20'
        },
        cancelled: {
            text: 'Cancelled',
            icon: XCircleIcon,
            className: 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 ring-rose-600/20 dark:ring-rose-500/20'
        },
    };

    const config = statusConfig[status] || statusConfig.scheduled;
    const Icon = config.icon;

    return (
        <div className={`inline-flex items-center gap-x-2 rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset ${config.className}`}>
            <Icon className="h-5 w-5" />
            <span>{config.text}</span>
        </div>
    );
}