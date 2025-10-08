// app/dashboard/events/[id]/TabNavigation.tsx

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

export default function TabNavigation({ eventId }: { eventId: string }) {
    const pathname = usePathname();

    // The new, path-based URLs for your dashboard tabs
    const tabs = [
        { name: 'Overview', href: `/dashboard/events/${eventId}` },
        { name: 'Announcements', href: `/dashboard/events/${eventId}/announcements` },
        { name: 'Chat', href: `/dashboard/events/${eventId}/chat` },
        { name: 'Feedback', href: `/dashboard/events/${eventId}/feedback` },
        { name: 'Admins', href: `/dashboard/events/${eventId}/admins` },
        { name: 'Settings', href: `/dashboard/events/${eventId}/settings` },
    ];

    return (
        <div className="border-b border-gray-200 dark:border-zinc-800">
            {/* Added overflow-x-auto for better responsiveness on small screens */}
            <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
                {tabs.map((tab) => (
                    <Link
                        key={tab.name}
                        href={tab.href}
                        className={clsx(
                            "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium",
                            // This logic now checks the exact URL path to highlight the active tab
                            pathname === tab.href
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-300'
                        )}
                    >
                        {tab.name}
                    </Link>
                ))}
            </nav>
        </div>
    );
}