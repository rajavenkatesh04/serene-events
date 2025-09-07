'use client';

import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
// UPDATED: Import Link and a new icon
import Link from 'next/link';
import { PowerIcon, BuildingOffice2Icon, UserCircleIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { logout } from '@/app/lib/actions';
import UserAvatar from './user-avatar';

type UserProfileProps = {
    user: {
        name: string;
        email: string;
        imageUrl: string;
        role: string;
        organizationName: string;
    };
};

export default function UserProfile({ user }: UserProfileProps) {
    const roleStyles: { [key: string]: string } = {
        master: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
        owner: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
        admin: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
        // MODIFIED: Added a 'god' role style just in case it's needed, based on your actions file
        god: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
        member: 'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300',
    };

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
                        <div className="space-y-2 border-b border-gray-200 p-2 text-sm dark:border-zinc-800">
                            <div className="flex items-center gap-2">
                                <BuildingOffice2Icon className="h-4 w-4 text-gray-500 dark:text-zinc-400" />
                                <p className="truncate text-gray-600 dark:text-zinc-300">{user.organizationName}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <UserCircleIcon className="h-4 w-4 text-gray-500 dark:text-zinc-400" />
                                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${roleStyles[user.role] || roleStyles.member}`}>
                                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                </span>
                            </div>
                        </div>

                        {/* --- NEW MENU ITEM START --- */}
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
                        {/* --- NEW MENU ITEM END --- */}

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
