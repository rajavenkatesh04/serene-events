'use client';

import { useState, useEffect, Fragment } from 'react';
import { BellIcon, CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, ArrowUpOnSquareIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { messaging } from '@/app/lib/firebase';
import { getToken } from 'firebase/messaging';
import { subscribeToTopic } from '@/app/lib/actions/eventActions'; // Adjust path if needed
import LoadingSpinner from "@/app/ui/dashboard/loading-spinner";
import { Dialog, Transition } from '@headlessui/react';

// Added a new status for iOS users who need PWA install instructions
type NotificationStatus = 'loading' | 'subscribed' | 'denied' | 'default' | 'unsupported' | 'ios_instructions';

// A small helper to detect if the user is on an Apple mobile device
const isIOS = () => typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

// A self-contained, redesigned status message that matches the new aesthetic
function StatusDisplay({ icon: Icon, message, className }: { icon: React.ElementType, message: string, className: string }) {
    return (
        <div className={`flex w-full items-center justify-center gap-2.5 rounded-lg px-4 py-2 text-sm font-medium ring-1 ring-inset ${className}`}>
            <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
            <span>{message}</span>
        </div>
    );
}

export default function NotificationButton({ eventId }: { eventId :string }) {
    const [status, setStatus] = useState<NotificationStatus>('loading');
    const [isIosModalOpen, setIsIosModalOpen] = useState(false);

    useEffect(() => {
        if (!('Notification' in window) || !('serviceWorker' in navigator) || !messaging) {
            setStatus('unsupported');
            return;
        }

        const isDeviceIOS = isIOS();
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

        // --- Smart iOS detection logic added here ---
        // If the user is on iOS but NOT running the installed PWA, show instructions.
        if (isDeviceIOS && !isStandalone) {
            setStatus('ios_instructions');
            return;
        }

        // Standard notification permission checks for everyone else
        if (Notification.permission === 'denied') {
            setStatus('denied');
        } else if (localStorage.getItem(`subscribed_to_${eventId}`) === 'true') {
            setStatus('subscribed');
        } else {
            setStatus('default');
        }
    }, [eventId]);

    // --- Your original, working handleSubscribe function is preserved exactly as you provided it. ---
    const handleSubscribe = async () => {
        if (!messaging) {
            setStatus('unsupported');
            return;
        }

        setStatus('loading');

        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                const swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
                const currentToken = await getToken(messaging, { serviceWorkerRegistration: swRegistration });

                if (currentToken) {
                    await subscribeToTopic(currentToken, eventId);
                    localStorage.setItem(`subscribed_to_${eventId}`, 'true');
                    setStatus('subscribed');
                } else {
                    console.error('Failed to get FCM token.');
                    setStatus('denied');
                }
            } else {
                setStatus('denied');
            }
        } catch (error) {
            console.error('An error occurred while subscribing to notifications: ', error);
            setStatus('default');
        }
    };


    const renderContent = () => {
        switch (status) {
            case 'subscribed':
                return <StatusDisplay icon={CheckCircleIcon} message="Subscribed to Updates" className="bg-emerald-500/10 text-emerald-400 ring-emerald-500/20" />;
            case 'denied':
                return <StatusDisplay icon={ExclamationTriangleIcon} message="Notifications Blocked" className="bg-amber-500/10 text-amber-400 ring-amber-500/20" />;
            case 'unsupported':
                return <StatusDisplay icon={XCircleIcon} message="Browser Not Supported" className="bg-rose-500/10 text-rose-400 ring-rose-500/20" />;
            case 'ios_instructions':
                return (
                    <button
                        onClick={() => setIsIosModalOpen(true)}
                        className="flex w-full items-center justify-center gap-2.5 rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 ring-1 ring-inset ring-white/20 transition-colors hover:bg-white/10"
                    >
                        <BellIcon className="h-5 w-5" />
                        <span>Enable Notifications on iOS</span>
                    </button>
                );
            default:
                return (
                    // --- Redesigned button styling to blend with your header. ---
                    <button
                        onClick={handleSubscribe}
                        disabled={status === 'loading'}
                        className="flex w-full items-center justify-center gap-2.5 rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 ring-1 ring-inset ring-white/20 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {status === 'loading' ? <LoadingSpinner /> : <BellIcon className="h-5 w-5" />}
                        <span>{status === 'loading' ? 'Subscribing...' : 'Get Notifications'}</span>
                    </button>
                );
        }
    };

    return (
        <>
            {renderContent()}

            {/* --- PWA Install Instructions Modal for iOS --- */}
            <Transition appear show={isIosModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsIosModalOpen(false)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-2xl bg-zinc-900 p-6 text-left align-middle shadow-xl ring-1 ring-white/10 transition-all">
                                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-zinc-100">
                                        Enable Notifications on your iPhone
                                    </Dialog.Title>
                                    <div className="mt-4 space-y-4 text-sm text-zinc-400">
                                        <p>To receive live updates on iOS, you need to add this page to your Home Screen.</p>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-800 ring-1 ring-zinc-700">
                                                    <ArrowUpOnSquareIcon className="h-6 w-6 text-zinc-300" />
                                                </div>
                                                <p>Tap the <span className="font-semibold text-zinc-200">Share</span> button in your browser&apos;s toolbar.</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-800 ring-1 ring-zinc-700">
                                                    {/* --- Replaced missing icon with PlusCircleIcon --- */}
                                                    <PlusCircleIcon className="h-6 w-6 text-zinc-300" />
                                                </div>
                                                <p>Scroll down and tap <span className="font-semibold text-zinc-200">&apos;Add to Home Screen&apos;</span>.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-6">
                                        <button
                                            type="button"
                                            className="inline-flex w-full justify-center rounded-md bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 ring-1 ring-inset ring-white/20 hover:bg-white/10"
                                            onClick={() => setIsIosModalOpen(false)}
                                        >
                                            Got it, thanks!
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    );
}