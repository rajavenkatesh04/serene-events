"use client"

import Link from "next/link";
import {useState} from "react";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <nav className="sticky top-0 z-50 mx-auto max-w-7xl border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80">
            <div className="flex items-center justify-between p-4 text-gray-900 dark:text-zinc-100">
                <Link href="/public">
                    <h1 className="text-xl transition-transform duration-300 hover:scale-120 hover:bg-gradient-to-r hover:from-green-300 hover:to-emerald-600 hover:bg-clip-text hover:text-transparent">
                        Luna.
                    </h1>
                </Link>


                {/* Desktop Navbar */}
                <div className="hidden md:block">
                    <ul className="flex items-center gap-6">
                        <li className="text-sm font-medium text-gray-700 transition-transform duration-300 hover:scale-120 hover:bg-gradient-to-r hover:from-green-300 hover:to-emerald-600 hover:bg-clip-text hover:text-transparent dark:text-zinc-300">
                            <Link href="/login">Login</Link>
                        </li>

                    </ul>
                </div>

                {/* Hamburger Menu Button */}
                <div className="flex items-center justify-center space-x-4 md:hidden">

                    <button
                        onClick={toggleMobileMenu}
                        className="flex h-6 w-6 flex-col items-center justify-center space-y-1"
                        aria-label="Toggle mobile menu"
                    >
                        <div className={`h-0.5 w-5 bg-current transition-all duration-300 ${isOpen ? 'translate-y-1.5 rotate-45' : ''}`}></div>
                        <div className={`h-0.5 w-5 bg-current transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`}></div>
                        <div className={`h-0.5 w-5 bg-current transition-all duration-300 ${isOpen ? '-translate-y-1.5 -rotate-45' : ''}`}></div>
                    </button>
                </div>
            </div>

            {/* Mobile Navbar */}
            <div className={`overflow-hidden transition-all duration-500 ease-in-out md:hidden ${isOpen ? 'max-h-60' : 'max-h-0'}`}>
                <ul className="space-y-4 border-t border-gray-200 p-5 dark:border-zinc-800">
                    <li className="font-medium text-gray-700 dark:text-zinc-300">
                        <Link href="/login" onClick={() => setIsOpen(false)}>Log In</Link>
                    </li>

                </ul>
            </div>
        </nav>
    );
}