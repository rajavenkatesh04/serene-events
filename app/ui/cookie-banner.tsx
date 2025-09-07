'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Helper function to manage the cookie that tracks consent
const getCookieConsent = (): string | null => {
    // In a client component, we can safely access document
    if (typeof window !== 'undefined') {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; cookie_consent=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    }
    return null;
};

const setCookieConsent = (consent: 'accepted' | 'declined') => {
    // Set cookie to expire in 1 year
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    document.cookie = `cookie_consent=${consent}; path=/; expires=${date.toUTCString()}; SameSite=Lax`;
    // Dispatch a custom event so other components (like analytics) can react
    window.dispatchEvent(new Event('cookie_consent_change'));
};


export default function CookieConsentBanner() {
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        // Only show the banner if consent has not already been given
        const consent = getCookieConsent();
        if (!consent) {
            setShowBanner(true);
        }
    }, []);

    const handleAccept = () => {
        setCookieConsent('accepted');
        setShowBanner(false);
    };

    const handleDecline = () => {
        setCookieConsent('declined');
        setShowBanner(false);
    };

    if (!showBanner) {
        return null;
    }

    return (
        <div
            // ▼▼▼ THIS IS THE ONLY LINE YOU NEED TO CHANGE ▼▼▼
            className="fixed z-50 bottom-4 left-4 right-4 rounded-lg border border-gray-200 bg-white p-4 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 sm:left-auto sm:w-full sm:max-w-md"
            role="dialog"
            aria-labelledby="cookie-consent-title"
        >
            <h2 id="cookie-consent-title" className="mb-2 text-lg font-semibold text-gray-900 dark:text-zinc-100">
                We Value Your Privacy
            </h2>
            <p className="mb-4 text-sm text-gray-700 dark:text-zinc-300">
                We use essential cookies for login and site preferences. With your consent, we also use analytics cookies (Vercel, Microsoft Clarity) to understand how you use our site and to make improvements.
                {' '}
                <Link href="/policies/privacy" className="underline hover:text-gray-900 dark:hover:text-zinc-100">
                    Learn more.
                </Link>
            </p>
            <div className="flex justify-end gap-3">
                <button
                    onClick={handleDecline}
                    className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                    Decline
                </button>
                <button
                    onClick={handleAccept}
                    className="flex h-10 items-center rounded-lg bg-gray-900 px-4 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                    Accept All
                </button>
            </div>
        </div>
    );
}