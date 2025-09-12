// app/ui/events/filter.tsx
'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import clsx from 'clsx';

const filters = [
    { name: 'All Events', value: 'all' },
    { name: 'Owned by Me', value: 'owner' },
    { name: 'Admin Of', value: 'admin' },
];

export default function EventFilter() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const currentFilter = searchParams.get('filter') || 'all';

    return (
        <div className="flex items-center space-x-2 rounded-lg bg-gray-100 p-1 dark:bg-zinc-800">
            {filters.map((filter) => {
                const params = new URLSearchParams(searchParams);
                params.set('filter', filter.value);
                // Reset to page 1 when filter changes
                params.set('page', '1');

                return (
                    <Link
                        key={filter.value}
                        href={`${pathname}?${params.toString()}`}
                        className={clsx(
                            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                            {
                                'bg-white text-gray-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100':
                                    currentFilter === filter.value,
                                'text-gray-600 hover:bg-gray-200 dark:text-zinc-400 dark:hover:bg-zinc-700/50':
                                    currentFilter !== filter.value,
                            },
                        )}
                    >
                        {filter.name}
                    </Link>
                );
            })}
        </div>
    );
}