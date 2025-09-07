'use client';

import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import Link from 'next/link';
import { PowerIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { logout } from '@/app/lib/actions';
import UserAvatar from './user-avatar';

// Simplified props, as role is no longer displayed here
type UserProfileProps = {
    user: {
        name: string;
        email: string;
        imageUrl: string;
    };
};

export default function UserProfile({ user }: UserProfileProps) {
    return (
        <Menu as="div" className="relative">
            <Menu.Button className="flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:hover:bg-zinc-800">
                <UserAvatar name={user.name} imageUrl={user.imageUrl} />
                <div className="hidden min-w-0 flex-1 md:block">
                    <p className="truncate font-medium text-gray-900 dark:text-zinc-100">{user.name}</p>
                    <p className="truncate text-xs text-gray-500 dark:text-zinc-400">{user.email}</p>
                </div>
            </Menu.Button>

            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className="absolute bottom-full mb-2 w-64 origin-bottom-left rounded-md border border-gray-200 bg-white shadow-lg focus:outline-none dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="p-1">
                        {/* Profile Settings Link */}
                        <Menu.Item>
                            {({ active }) => (
                                <Link
                                    href="/dashboard/profile"
                                    className={`${
                                        active ? 'bg-gray-100 dark:bg-zinc-800' : ''
                                    } group flex w-full items-center gap-2 rounded-md p-2 text-sm text-gray-900 dark:text-zinc-200`}
                                >
                                    <Cog6ToothIcon className="h-5 w-5" />
                                    Profile Settings
                                </Link>
                            )}
                        </Menu.Item>

                        {/* Sign Out Button */}
                        <Menu.Item>
                            {({ active }) => (
                                <form action={logout} className="w-full">
                                    <button
                                        type="submit"
                                        className={`${
                                            active ? 'bg-red-500 text-white dark:bg-red-600/50' : 'text-gray-900 dark:text-zinc-200'
                                        } group flex w-full items-center gap-2 rounded-md p-2 text-sm`}
                                    >
                                        <PowerIcon className="h-5 w-5" />
                                        Sign Out
                                    </button>
                                </form>
                            )}
                        </Menu.Item>
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    );
}