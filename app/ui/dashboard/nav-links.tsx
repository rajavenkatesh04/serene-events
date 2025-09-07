"use client"

import { usePathname } from "next/navigation";
import Link from "next/link";
import clsx from 'clsx';
import { HomeIcon, CalendarDaysIcon, EnvelopeIcon, BoltIcon } from '@heroicons/react/24/outline';
import InvitationBadge from './invitation-badge';

const links = [
    { name: 'Overview', href: '/dashboard', icon: HomeIcon },
    { name: 'Events', href: '/dashboard/events', icon: CalendarDaysIcon },
    { name: 'Invitations', href: '/dashboard/invitations', icon: EnvelopeIcon },
    { name: 'Master', href: '/dashboard/master', icon: BoltIcon },
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
                            'relative flex h-12 w-12 items-center justify-center rounded-full text-gray-600 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100',
                            'md:h-[48px] md:w-full md:rounded-md md:justify-start md:px-3 md:gap-2',
                            {
                                'border border-pink-200 bg-pink-100 text-pink-600 dark:border-pink-800/50 dark:bg-pink-900/20 dark:text-pink-300': pathname === link.href,
                                'md:bg-gray-100 md:text-gray-900 md:dark:bg-zinc-800 md:dark:text-zinc-100': pathname === link.href,
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