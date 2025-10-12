'use client';

import { useState, useEffect } from 'react';
import { BellIcon, CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { messaging } from '@/app/lib/firebase';
import { getToken } from 'firebase/messaging';
import { subscribeToTopic } from '@/app/lib/actions/eventActions';
import LoadingSpinner from "@/app/ui/dashboard/loading-spinner";
import {InformationCircleIcon} from "@heroicons/react/16/solid";

type NotificationStatus = 'loading' | 'subscribed' | 'denied' | 'default' | 'unsupported';

function StatusBadge({ icon: Icon, message, className, children }: { icon: React.ElementType, message: string, className: string, children?: React.ReactNode }) {
    return (
        <div className={`rounded-lg px-3 py-2 text-sm ${className}`}>
            <div className="flex items-center gap-2">
                <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                <p className="font-medium">{message}</p>
            </div>
            {children}
        </div>
    );
}

export default function NotificationButton({ eventId }: { eventId: string }) {
    const [status, setStatus] = useState<NotificationStatus>('loading');

    useEffect(() => {
        if (!('Notification' in window) || !('serviceWorker' in navigator) || !messaging) {
            setStatus('unsupported');
            return;
        }
        if (Notification.permission === 'denied') {
            setStatus('denied');
        } else if (localStorage.getItem(`subscribed_to_${eventId}`) === 'true') {
            setStatus('subscribed');
        } else {
            setStatus('default');
        }
    }, [eventId]);

    const handleSubscribe = async () => {
        if (!messaging) {
            setStatus('unsupported');
            return;
        }

        setStatus('loading');

        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                // --- FIX APPLIED ---
                // This now correctly registers the service worker directly.
                // It relies on the service worker having its own hardcoded config, which is much more reliable.
                const swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
                const currentToken = await getToken(messaging, { serviceWorkerRegistration: swRegistration });

                if (currentToken) {
                    await subscribeToTopic(currentToken, eventId);
                    localStorage.setItem(`subscribed_to_${eventId}`, 'true');
                    setStatus('subscribed');
                } else {
                    // This can happen if getToken fails for some reason
                    console.error('Failed to get FCM token.');
                    setStatus('denied');
                }
            } else {
                setStatus('denied');
            }
        } catch (error) {
            console.error('An error occurred while subscribing to notifications: ', error);
            setStatus('default'); // Reset to default on error
        }
    };

    if (status === 'subscribed') {
        return <StatusBadge icon={CheckCircleIcon} message="You are subscribed to notifications." className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300" />;
    }
    if (status === 'denied') {
        return <StatusBadge icon={ExclamationTriangleIcon} message="Notification permissions are blocked." className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300" />;
    }
    if (status === 'unsupported') {
        return <StatusBadge
            icon={InformationCircleIcon}
            message="Install app to enable notifications"
            className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
        >
            <div className="mt-2 text-sm">
                <p className="font-medium mb-2">To receive notifications on iOS:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>Tap the <strong>Share</strong> button <span className="inline-block">⎋</span></li>
                    <li>Scroll down and select <strong>&quot;Add to Home Screen&ldquo;</strong></li>
                    <li>Tap <strong>&quot;Add&ldquo;</strong> to install the app</li>
                    <li>Open the app from your home screen</li>
                </ol>
            </div>
        </StatusBadge>
    }

    return (
        <button
            onClick={handleSubscribe}
            disabled={status === 'loading'}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400 dark:disabled:bg-zinc-700"
        >
            {status === 'loading' ? <LoadingSpinner className="mr-2" /> : <BellIcon className="h-5 w-5" />}
            {status === 'loading' ? 'Subscribing...' : 'Get Notifications'}
        </button>
    );
}