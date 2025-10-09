"use client"

import { usePathname } from "next/navigation";
import Link from "next/link";
import clsx from 'clsx';
import { HomeIcon, CalendarDaysIcon, TicketIcon, KeyIcon, ClockIcon } from '@heroicons/react/24/outline';
import InvitationBadge from './invitation-badge';

const links = [
    { name: 'Overview', href: '/dashboard', icon: HomeIcon },
    { name: 'Events', href: '/dashboard/events', icon: CalendarDaysIcon },
    { name: 'Invitations', href: '/dashboard/invitations', icon: TicketIcon },
    { name: 'Past Events', href: '/dashboard/myevents', icon: ClockIcon },
    { name: 'Master', href: '/dashboard/master', icon: KeyIcon },
];

export default function NavLinks({ inviteCount, userRole }: { inviteCount: number, userRole? : string }) {
    const pathname = usePathname();

    return (
        <div className="flex flex-row items-center justify-end gap-2 md:flex-col md:justify-start md:space-y-2 md:gap-0">
            {links.map((link) => {

                if (link.name === 'Master' && userRole !== 'god') {
                    return null;
                }

                const LinkIcon = link.icon;

                return (
                    <Link
                        key={link.name}
                        href={link.href}
                        className={clsx(
                            // Base styles for all links
                            'relative flex h-12 w-12 items-center justify-center rounded-full text-gray-600 transition-colors duration-200 hover:bg-blue-100/50 hover:text-blue-600 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100',

                            // Responsive styles for medium screens and up
                            'md:h-[48px] md:w-full md:rounded-md md:justify-start md:px-3 md:gap-2',

                            // Active link styles using the new brand color
                            {
                                'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-300': pathname === link.href,
                            },
                        )}
                        title={link.name}
                    >
                        <LinkIcon className="w-6" />
                        <p className="hidden md:block">{link.name}</p>

                        {link.name === 'Invitations' && (
                            <InvitationBadge initialCount={inviteCount} />
                        )}
                    </Link>
                );
            })}
        </div>
    );
}