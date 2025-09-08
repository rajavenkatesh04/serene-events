'use client';

import { useState, useEffect } from 'react';
import ProfileAvatar from './profile-avatar';

type ProfileHeaderProps = {
    displayName: string;
    imageUrl: string | null | undefined;
    role: string;
};

// This function now runs on the client, using their local time
const getGreeting = () => {
    // getHours() uses the user's system's local time
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 21) return 'Good evening';
    return 'Good night';
};

export default function ProfileHeader({ displayName, imageUrl, role }: ProfileHeaderProps) {
    // State for the greeting to avoid hydration mismatch
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        setGreeting(getGreeting());
    }, []);

    // --- NEW: Revamped "Glassy" Role Styles ---
    const roleStyles: { [key:string]: string } = {
        god:      'bg-rose-500/10 text-rose-500 border border-rose-500/20 dark:text-rose-400',
        master:   'bg-violet-500/10 text-violet-500 border border-violet-500/20 dark:text-violet-400',
        owner:    'bg-amber-500/10 text-amber-500 border border-amber-500/20 dark:text-amber-400',
        admin:    'bg-blue-500/10 text-blue-500 border border-blue-500/20 dark:text-blue-400',
        user:     'bg-zinc-500/10 text-zinc-500 border border-zinc-500/20 dark:text-zinc-400',
    };

    return (
        <div className="mb-10 rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-900 md:p-8">
            <div className="flex flex-col items-center gap-6 sm:flex-row">
                <ProfileAvatar name={displayName} imageUrl={imageUrl} />
                <div className="flex-1 text-center sm:text-left">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-zinc-100">
                        {greeting && (
                            <span className="font-light text-gray-500 dark:text-zinc-400">{greeting}, </span>
                        )}
                        {displayName || 'there'}
                    </h1>

                    {/* --- MODIFIED: Larger size and new base styles for the badge --- */}
                    <span
                        className={`mt-2 inline-flex items-center rounded-lg px-4 py-1.5 text-xm font-medium tracking-wide transition-colors
                        ${roleStyles[role] || roleStyles.user}`}
                    >
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                    </span>
                </div>
            </div>
        </div>
    );
}