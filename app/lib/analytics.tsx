'use client';

import { useState, useEffect } from 'react';
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import Script from 'next/script';

// Helper function to get the consent status from the cookie
const getCookieConsent = (): string | null => {
    // This check ensures the code only runs on the client-side
    if (typeof window !== 'undefined') {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; cookie_consent=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    }
    return null;
};

export function Analytics() {
    const [consent, setConsent] = useState<string | null>(null);

    useEffect(() => {
        // Set the initial consent status from the cookie when the component mounts
        setConsent(getCookieConsent());

        // The cookie banner dispatches a custom event when the user makes a choice.
        // This listener ensures this component reacts instantly without a page reload.
        const handleConsentChange = () => {
            setConsent(getCookieConsent());
        };

        window.addEventListener('cookie_consent_change', handleConsentChange);

        // Cleanup the event listener when the component is unmounted
        return () => {
            window.removeEventListener('cookie_consent_change', handleConsentChange);
        };
    }, []); // The empty dependency array ensures this effect runs only once on mount

    // --- This is the core logic ---
    // If consent has not been explicitly accepted, render nothing.
    if (consent !== 'accepted') {
        return null;
    }

    // If consent is 'accepted', render the analytics scripts.
    return (
        <>
            {/* Vercel Analytics */}
            <VercelAnalytics />

            {/* Cloudflare Web Analytics */}
            <Script
                strategy="afterInteractive"
                src="https://static.cloudflareinsights.com/beacon.min.js"
                data-cf-beacon='{"token": "a270989e39084ad79012eb2e96ab5b1f"}'
            />

            {/* Microsoft Clarity Script */}
            <Script id="microsoft-clarity" strategy="afterInteractive">
                {`
                    (function(c,l,a,r,i,t,y){
                        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                    })(window, document, "clarity", "script", "sliaoaoq2a");
                `}
            </Script>
        </>
    );
}