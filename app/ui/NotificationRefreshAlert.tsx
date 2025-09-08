'use client';

import { useState, useEffect } from 'react';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { messaging } from '@/app/lib/firebase';
import { getToken } from 'firebase/messaging';
import { subscribeToTopic } from '@/app/lib/actions/eventActions';
import toast from 'react-hot-toast';
import LoadingSpinner from "@/app/ui/dashboard/loading-spinner";

function NotificationRefreshAlert({ eventId }: { eventId: string }) {
    const [shouldShow, setShouldShow] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        const checkIfAlertNeeded = () => {
            const dismissedKey = `notification-alert-dismissed-${eventId}`;
            if (sessionStorage.getItem(dismissedKey)) {
                return;
            }

            // Here's our first important null check - we verify messaging is available
            // before deciding whether to show the alert at all
            const hasNotificationSupport = (
                'Notification' in window &&
                'serviceWorker' in navigator &&
                messaging !== null  // This is the key addition
            );

            if (!hasNotificationSupport) {
                return; // Don't show on unsupported devices or when messaging is null
            }

            const isCurrentlySubscribed = localStorage.getItem(`subscribed_to_${eventId}`) === 'true';
            const lastSubscriptionTime = localStorage.getItem(`last-subscription-${eventId}`);

            let shouldShowAlert = false;

            if (!isCurrentlySubscribed) {
                shouldShowAlert = true;
            } else if (lastSubscriptionTime) {
                const subscriptionAge = Date.now() - parseInt(lastSubscriptionTime);
                const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;

                if (subscriptionAge > threeDaysInMs) {
                    shouldShowAlert = true;
                }
            } else {
                shouldShowAlert = true;
            }

            setShouldShow(shouldShowAlert);
        };

        const timer = setTimeout(checkIfAlertNeeded, 1000);
        return () => clearTimeout(timer);
    }, [eventId]);

    const handleRefreshSubscription = async () => {
        // This is where we add our comprehensive null check and error handling
        // Think of this as putting on safety gear before starting work
        if (!messaging) {
            toast.error('Notifications are not supported on this device or browser.');
            return;
        }

        setIsRefreshing(true);

        try {
            // Clear existing notification data - this is like clearing your workspace
            localStorage.removeItem(`subscribed_to_${eventId}`);
            localStorage.removeItem(`last-subscription-${eventId}`);
            localStorage.removeItem(`fcm_token_${eventId}`);
            localStorage.removeItem('fcm_token');

            // Request fresh notification permission
            const permission = await Notification.requestPermission();

            if (permission !== 'granted') {
                toast.error('Please allow notifications in your browser settings to receive updates.');
                setIsRefreshing(false);
                return;
            }

            // Prepare Firebase configuration
            const firebaseConfig = {
                apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
                authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
                messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
                appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
            };

            const encodedConfig = encodeURIComponent(JSON.stringify(firebaseConfig));
            const swUrl = `/firebase-messaging-sw.js?firebaseConfig=${encodedConfig}`;

            const swRegistration = await navigator.serviceWorker.register(swUrl);

            // Now we can safely call getToken because we've verified messaging is not null
            // TypeScript is happy because we've proven messaging exists at this point
            const freshToken = await getToken(messaging, {
                serviceWorkerRegistration: swRegistration,
                vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
            });

            if (freshToken) {
                await subscribeToTopic(freshToken, eventId);

                // Store the new subscription information
                localStorage.setItem(`subscribed_to_${eventId}`, 'true');
                localStorage.setItem(`last-subscription-${eventId}`, Date.now().toString());
                localStorage.setItem(`fcm_token_${eventId}`, freshToken);
                localStorage.setItem('fcm_token', freshToken);

                setShouldShow(false);
                toast.success('🎉 Notifications refreshed! You\'ll now receive all updates.');
                sessionStorage.setItem(`notification-alert-dismissed-${eventId}`, 'resolved');

            } else {
                throw new Error('Failed to get notification token');
            }

        } catch (error) {
            console.error('Failed to refresh notification subscription:', error);
            toast.error('Failed to refresh notifications. Please try again or check your browser settings.');
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleDismiss = () => {
        setIsDismissed(true);
        setShouldShow(false);
        sessionStorage.setItem(`notification-alert-dismissed-${eventId}`, 'dismissed');
    };

    if (!shouldShow || isDismissed) {
        return null;
    }

    return (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/50 dark:bg-amber-950/20">
            <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />

                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                        Not receiving notifications?
                    </h3>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                        If you&apos;re missing updates, your notification subscription might need refreshing. This takes just a few seconds.
                    </p>

                    <button
                        onClick={handleRefreshSubscription}
                        disabled={isRefreshing}
                        className="inline-flex items-center gap-2 rounded-md bg-amber-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-amber-500 disabled:bg-amber-400 disabled:cursor-not-allowed dark:bg-amber-700 dark:hover:bg-amber-600"
                    >
                        {isRefreshing ? (
                            <>
                                <LoadingSpinner className="h-4 w-4" />
                                <span>Refreshing...</span>
                            </>
                        ) : (
                            <>
                                <span>🔄 Refresh Notifications</span>
                            </>
                        )}
                    </button>
                </div>

                <button
                    onClick={handleDismiss}
                    className="flex-shrink-0 rounded-md p-1.5 text-amber-500 hover:text-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:ring-offset-2 focus:ring-offset-amber-50 dark:text-amber-400 dark:hover:text-amber-300"
                    aria-label="Dismiss notification alert"
                >
                    <XMarkIcon className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

export default NotificationRefreshAlert;