'use client';

import { useState, useEffect } from 'react';
import { WifiIcon, CloudIcon } from '@heroicons/react/24/solid';

export default function NetworkStatusIndicator() {
    // State to hold the online status and whether to show the indicator
    const [status, setStatus] = useState({ isOnline: true, showIndicator: false });

    useEffect(() => {
        // Set the initial status when the component mounts
        setStatus({ isOnline: navigator.onLine, showIndicator: !navigator.onLine });

        // Handler to update state when browser goes online
        const handleOnline = () => {
            setStatus({ isOnline: true, showIndicator: true });
            // Hide the "Back Online" message after 3 seconds
            setTimeout(() => setStatus(prev => ({ ...prev, showIndicator: false })), 3000);
        };

        // Handler to update state when browser goes offline
        const handleOffline = () => {
            setStatus({ isOnline: false, showIndicator: true });
        };

        // Add event listeners for online/offline events
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Cleanup function to remove event listeners when the component unmounts
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []); // Empty dependency array ensures this effect runs only once

    // Don't render anything if the indicator shouldn't be shown
    if (!status.showIndicator) {
        return null;
    }

    const { isOnline } = status;

    return (
        <div
            className={`fixed bottom-4 left-1/2 z-50 -translate-x-1/2 transform rounded-full px-4 py-2 text-sm font-medium text-white shadow-lg transition-all duration-300
                ${isOnline ? 'bg-green-600' : 'bg-slate-800'}`
            }
        >
            <div className="flex items-center gap-2">
                {isOnline ? <CloudIcon className="h-5 w-5" /> : <WifiIcon className="h-5 w-5" />}
                <span>{isOnline ? 'You are back online' : 'You are currently offline'}</span>
            </div>
        </div>
    );
}