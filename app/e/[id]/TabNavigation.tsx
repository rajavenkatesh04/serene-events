'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

export default function TabNavigation({ eventId }: { eventId: string }) {
    const pathname = usePathname();

    const tabs = [
        { name: 'Announcements', href: `/e/${eventId}` },
        { name: 'Chat', href: `/e/${eventId}/chat` },
        { name: 'Feedback', href: `/e/${eventId}/feedback` },
        // { name: 'Engage', href: `/e/${eventId}/engage` },
    ];

    return (
        <div className="w-full border-b border-gray-200 dark:border-zinc-800">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {tabs.map((tab) => (
                    <Link
                        key={tab.name}
                        href={tab.href}
                        className={clsx(
                            "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium",
                            // Check if the current path exactly matches the tab's href
                            pathname === tab.href
                                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
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