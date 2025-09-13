'use client';

import Link from 'next/link';
import Image from 'next/image';
import LunaLogo from "@/app/ui/luna-logo";

// This Navbar is now simpler and only responsible for branding.
// The search bar has been moved into the Announcements component where it's actually used.
export default function Navbar() {
    return (
        <nav className="sticky top-0 z-40 border-b border-gray-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 p-4 text-gray-900 dark:text-zinc-100">
                <div className="flex-shrink-0">
                    <Link href="/">
                        <LunaLogo />
                        {/*<Image*/}
                        {/*    */}
                        {/*    src="/luna-logo.png"*/}
                        {/*    alt="Luna Logo"*/}
                        {/*    width={100}*/}
                        {/*    height={32}*/}
                        {/*    className="h-8 w-auto"*/}
                        {/*    priority*/}
                        {/*/>*/}
                    </Link>
                </div>
            </div>
        </nav>
    );
}