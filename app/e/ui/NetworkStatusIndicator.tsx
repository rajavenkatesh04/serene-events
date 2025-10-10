'use client';

import { useState, useEffect, useCallback } from 'react';
import { WifiIcon, SignalIcon, SignalSlashIcon } from '@heroicons/react/24/solid';

type NetworkQuality = 'excellent' | 'good' | 'poor' | 'offline';

interface NetworkStatus {
    isOnline: boolean;
    quality: NetworkQuality;
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

export default function NetworkStatusIndicator() {
    const [status, setStatus] = useState<NetworkStatus>({
        isOnline: true,
        quality: 'excellent'
    });
    const [showIndicator, setShowIndicator] = useState(false);
    const [isSliding, setIsSliding] = useState(false);

    // Function to determine network quality based on connection info
    const getNetworkQuality = useCallback((connection: NetworkInformation | undefined): NetworkQuality => {
        if (!navigator.onLine) return 'offline';

        if (!connection) return 'good';

        const { effectiveType, downlink, rtt } = connection;

        // Excellent: 4g with good speed and low latency
        if (effectiveType === '4g' && downlink && downlink > 5 && rtt && rtt < 100) {
            return 'excellent';
        }

        // Good: 4g or 3g with decent speed
        if ((effectiveType === '4g' || effectiveType === '3g') && downlink && downlink > 1) {
            return 'good';
        }

        // Poor: slow connection or 2g
        if (effectiveType === '2g' || effectiveType === 'slow-2g' || (downlink && downlink < 1) || (rtt && rtt > 300)) {
            return 'poor';
        }

        return 'good';
    }, []);

    // Function to update network status
    const updateNetworkStatus = useCallback(() => {
        const nav = navigator as NavigatorWithConnection;
        const connection = nav.connection || nav.mozConnection || nav.webkitConnection;

        const quality = getNetworkQuality(connection);
        const newStatus: NetworkStatus = {
            isOnline: navigator.onLine,
            quality,
            downlink: connection?.downlink,
            effectiveType: connection?.effectiveType,
            rtt: connection?.rtt
        };

        setStatus(newStatus);
        return newStatus;
    }, [getNetworkQuality]);

    // Show indicator with animation
    const showIndicatorWithAnimation = useCallback((duration = 4000) => {
        setShowIndicator(true);
        setIsSliding(true);

        setTimeout(() => {
            setIsSliding(false);
            setTimeout(() => setShowIndicator(false), 300);
        }, duration);
    }, []);

    useEffect(() => {
        // Initial status check
        const initialStatus = updateNetworkStatus();

        // Show indicator if starting offline or with poor connection
        if (!initialStatus.isOnline || initialStatus.quality === 'poor') {
            setShowIndicator(true);
        }

        // Online/Offline handlers
        const handleOnline = () => {
            updateNetworkStatus();
            showIndicatorWithAnimation(3000);
        };

        const handleOffline = () => {
            updateNetworkStatus();
            setShowIndicator(true);
        };

        // Network change handler
        const handleConnectionChange = () => {
            const newStatus = updateNetworkStatus();

            // Only show indicator for significant changes (poor quality or offline)
            if (newStatus.quality === 'poor' || !newStatus.isOnline) {
                showIndicatorWithAnimation(5000);
            }
        };

        // Add event listeners
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        const nav = navigator as NavigatorWithConnection;
        const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
        if (connection) {
            connection.addEventListener('change', handleConnectionChange);
        }

        // Periodic check for network quality (every 30 seconds)
        const intervalId = setInterval(() => {
            const newStatus = updateNetworkStatus();
            if (newStatus.quality === 'poor') {
                showIndicatorWithAnimation(4000);
            }
        }, 30000);

        // Cleanup
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            if (connection) {
                connection.removeEventListener('change', handleConnectionChange);
            }
            clearInterval(intervalId);
        };
    }, [updateNetworkStatus, showIndicatorWithAnimation]);

    // Don't render if indicator is hidden
    if (!showIndicator) {
        return null;
    }

    // Get colors and message based on status
    const getStatusConfig = () => {
        if (!status.isOnline) {
            return {
                bg: 'bg-slate-900',
                icon: SignalSlashIcon,
                message: 'No internet connection',
                showDetails: false
            };
        }

        switch (status.quality) {
            case 'excellent':
                return {
                    bg: 'bg-emerald-600',
                    icon: WifiIcon,
                    message: 'Connected',
                    showDetails: true
                };
            case 'good':
                return {
                    bg: 'bg-blue-600',
                    icon: SignalIcon,
                    message: 'Good connection',
                    showDetails: true
                };
            case 'poor':
                return {
                    bg: 'bg-amber-600',
                    icon: SignalSlashIcon,
                    message: 'Slow connection',
                    showDetails: true
                };
            default:
                return {
                    bg: 'bg-slate-700',
                    icon: WifiIcon,
                    message: 'Connected',
                    showDetails: false
                };
        }
    };

    const config = getStatusConfig();
    const Icon = config.icon;

    return (
        <div
            className={`fixed left-0 right-0 top-0 z-[9999] transition-all duration-300 ${
                isSliding ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
            }`}
        >
            <div className={`${config.bg} px-4 py-2 shadow-lg`}>
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 flex-shrink-0 text-white" />
                        <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-white">
                {config.message}
              </span>

                            {config.showDetails && status.effectiveType && (
                                <span className="hidden text-xs text-white/80 sm:inline">
                  {status.effectiveType.toUpperCase()}
                                    {status.downlink && ` • ${status.downlink.toFixed(1)} Mbps`}
                                    {status.rtt && ` • ${status.rtt}ms`}
                </span>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            setIsSliding(false);
                            setTimeout(() => setShowIndicator(false), 300);
                        }}
                        className="flex-shrink-0 text-white/80 transition-colors hover:text-white"
                        aria-label="Dismiss"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Progress bar for auto-dismiss */}
            {isSliding && status.isOnline && (
                <div className="h-0.5 w-full bg-white/20">
                    <div
                        className="h-full bg-white/40 transition-all duration-[4000ms] ease-linear"
                        style={{ width: isSliding ? '0%' : '100%' }}
                    />
                </div>
            )}
        </div>
    );
}