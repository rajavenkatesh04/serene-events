'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { WifiIcon, SignalIcon, SignalSlashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

// --- Type Definitions ---
type NetworkQuality = 'excellent' | 'good' | 'poor' | 'offline';

interface NetworkStatus {
    isOnline: boolean;
    quality: NetworkQuality;
    message: string;
    downlink?: number;
    effectiveType?: string;
    rtt?: number;
}

interface NetworkInformation extends EventTarget {
    downlink?: number;
    effectiveType?: string;
    rtt?: number;
    saveData?: boolean;
    addEventListener(type: string, listener: EventListener): void;
    removeEventListener(type: string, listener: EventListener): void;
}

interface NavigatorWithConnection extends Navigator {
    connection?: NetworkInformation;
    mozConnection?: NetworkInformation;
    webkitConnection?: NetworkInformation;
}

// --- Main Component ---
export default function NetworkStatusIndicator() {
    const [status, setStatus] = useState<NetworkStatus>({
        isOnline: true,
        quality: 'excellent',
        message: 'Connected',
    });
    const [isVisible, setIsVisible] = useState(false);

    // useRef to track the previous network state to show contextual messages
    const prevStatusRef = useRef<NetworkStatus>(status);
    const hideTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

    /**
     * Determines network quality based on the Network Information API.
     */
    const getNetworkQuality = useCallback((connection?: NetworkInformation): NetworkQuality => {
        if (!navigator.onLine) return 'offline';
        if (!connection) return 'good'; // Default if API is not supported

        const { effectiveType, downlink, rtt } = connection;

        if (effectiveType === '4g' && downlink && downlink > 5 && rtt && rtt < 100) {
            return 'excellent';
        }
        if ((effectiveType === '4g' || effectiveType === '3g') && downlink && downlink > 1.5) {
            return 'good';
        }
        if (effectiveType?.includes('2g') || (downlink && downlink < 0.5) || (rtt && rtt > 500)) {
            return 'poor';
        }
        return 'good'; // Fallback
    }, []);

    /**
     * Shows the indicator banner and sets a timeout to hide it automatically.
     */
    const showIndicator = (duration: number = 4000) => {
        clearTimeout(hideTimeoutRef.current);
        setIsVisible(true);
        hideTimeoutRef.current = setTimeout(() => {
            setIsVisible(false);
        }, duration);
    };

    const hideIndicator = () => {
        clearTimeout(hideTimeoutRef.current);
        setIsVisible(false);
    }

    /**
     * Core function to update the network status state.
     * It intelligently sets messages based on the transition from the previous state.
     */
    const updateNetworkStatus = useCallback(() => {
        const nav = navigator as NavigatorWithConnection;
        const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
        const prevStatus = prevStatusRef.current;

        const isOnline = navigator.onLine;
        const quality = getNetworkQuality(connection);

        let message = '';
        let shouldShowIndicator = false;
        let duration = 4000;

        if (!isOnline) {
            message = 'No internet connection. Trying to reconnect...';
            // Show indicator persistently when offline
            shouldShowIndicator = true;
        } else {
            // Check if we just came back online
            if (!prevStatus.isOnline && isOnline) {
                message = "You're back online! 🎉";
                shouldShowIndicator = true;
                duration = 3000;
            } else {
                switch (quality) {
                    case 'excellent':
                        // Only show a message if we improved from poor
                        if (prevStatus.quality === 'poor') {
                            message = 'Connection is stable again.';
                            shouldShowIndicator = true;
                        } else {
                            message = 'Excellent connection';
                        }
                        break;
                    case 'good':
                        message = 'Good connection';
                        break;
                    case 'poor':
                        // Show indicator only if the state changed to poor
                        if (prevStatus.quality !== 'poor') {
                            message = 'Connection is unstable. You may experience issues.';
                            shouldShowIndicator = true;
                            duration = 5000;
                        } else {
                            message = 'Connection remains unstable.';
                        }
                        break;
                }
            }
        }

        const newStatus: NetworkStatus = {
            isOnline,
            quality: isOnline ? quality : 'offline',
            message,
            downlink: connection?.downlink,
            effectiveType: connection?.effectiveType,
            rtt: connection?.rtt
        };

        setStatus(newStatus);

        // Only show indicator if there's a meaningful change
        if (shouldShowIndicator) {
            // For offline, duration is infinite until reconnected
            if (!isOnline) {
                setIsVisible(true);
                clearTimeout(hideTimeoutRef.current);
            } else {
                showIndicator(duration);
            }
        }

        // Update the ref to the new state for the next check
        prevStatusRef.current = newStatus;

    }, [getNetworkQuality]);


    useEffect(() => {
        // Set initial status without showing the indicator unless offline
        if (!navigator.onLine) {
            updateNetworkStatus();
        }

        // Add event listeners for online/offline changes
        window.addEventListener('online', updateNetworkStatus);
        window.addEventListener('offline', updateNetworkStatus);

        // Add event listener for network quality changes
        const nav = navigator as NavigatorWithConnection;
        const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
        if (connection) {
            connection.addEventListener('change', updateNetworkStatus);
        }

        // Cleanup function to remove listeners
        return () => {
            window.removeEventListener('online', updateNetworkStatus);
            window.removeEventListener('offline', updateNetworkStatus);
            if (connection) {
                connection.removeEventListener('change', updateNetworkStatus);
            }
            clearTimeout(hideTimeoutRef.current);
        };
    }, [updateNetworkStatus]);

    // --- Render Logic ---

    const getStatusConfig = () => {
        const { quality, isOnline } = status;

        if (!isOnline) {
            return {
                bg: 'bg-slate-800',
                icon: SignalSlashIcon,
                showDetails: false,
            };
        }

        switch (quality) {
            case 'excellent':
                return { bg: 'bg-emerald-600', icon: WifiIcon, showDetails: true };
            case 'good':
                return { bg: 'bg-blue-600', icon: SignalIcon, showDetails: true };
            case 'poor':
                return { bg: 'bg-amber-600', icon: ExclamationTriangleIcon, showDetails: true };
            default:
                return { bg: 'bg-slate-700', icon: WifiIcon, showDetails: false };
        }
    };

    const config = getStatusConfig();
    const Icon = config.icon;

    return (
        <div
            // Animate slide-down and fade-in
            className={`fixed left-0 right-0 top-0 z-[9999] transition-all duration-300 ease-in-out ${
                isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
            }`}
        >
            <div className={`${config.bg} px-4 py-2.5 shadow-lg`}>
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
                    <div className="flex flex-1 items-center gap-3">
                        <Icon className="h-5 w-5 flex-shrink-0 text-white" />
                        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                            <span className="text-sm font-medium text-white">
                                {status.message}
                            </span>
                            {config.showDetails && status.isOnline && (
                                <span className="hidden text-xs text-white/70 sm:inline">
                                    {status.effectiveType?.toUpperCase()}
                                    {status.downlink && ` • ${status.downlink.toFixed(1)} Mbps`}
                                    {status.rtt && ` • ${status.rtt}ms`}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={hideIndicator}
                        className="-m-1 flex-shrink-0 rounded-full p-1 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                        aria-label="Dismiss"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Progress bar for auto-dismiss (only shown when online) */}
            {isVisible && status.isOnline && (
                <div className="h-0.5 w-full bg-white/20">
                    <div
                        key={status.message} // Re-trigger animation on message change
                        className="h-full bg-white/40"
                        style={{
                            transition: 'width 4s linear',
                            width: '0%',  // ✅ Single width property
                        }}
                    />
                </div>
            )}
        </div>
    );
}