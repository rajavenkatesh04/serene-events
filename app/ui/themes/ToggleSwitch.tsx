"use client"

import { useTheme } from 'next-themes';
import { MoonIcon, SunIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import clsx from 'clsx'; // Import clsx

export default function ToggleSwitch() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!mounted) {
        return <div className="h-9 w-9" />;
    }

    const options = [
        { name: 'Light', value: 'light', icon: SunIcon },
        { name: 'Dark', value: 'dark', icon: MoonIcon },
        { name: 'System', value: 'system', icon: ComputerDesktopIcon },
    ];

    return (
        <Menu as="div" className="relative">
            <Menu.Button className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800">
                <span className="sr-only">Open theme switcher</span>
                {resolvedTheme === 'dark' ? (
                    <MoonIcon className="h-5 w-5" />
                ) : (
                    <SunIcon className="h-5 w-5" />
                )}
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
                <Menu.Items className="absolute right-0 mt-2 w-36 origin-top-right rounded-md border border-gray-200 bg-white shadow-lg focus:outline-none dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="p-1">
                        {options.map((option) => (
                            <Menu.Item key={option.value}>
                                {({ active }) => (
                                    <button
                                        onClick={() => {
                                            console.log('Setting theme to:', option.value);
                                            setTheme(option.value)
                                        }}
                                        className={clsx(
                                            'group flex w-full items-center gap-2 rounded-md p-2 text-sm text-gray-900 dark:text-zinc-100',
                                            // Apply background if the item is active (hovered) OR if it's the currently set theme
                                            { 'bg-gray-100 dark:bg-zinc-800': active || theme === option.value }
                                        )}
                                    >
                                        <option.icon className="h-5 w-5" />
                                        {option.name}
                                    </button>
                                )}
                            </Menu.Item>
                        ))}
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    );
}