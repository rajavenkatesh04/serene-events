'use client';

import { useState, useRef, Fragment } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, LinkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export default function InteractiveQrCode({ eventId }: { eventId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const qrCodeRef = useRef<SVGSVGElement>(null);

    const eventUrl = typeof window !== 'undefined' ? `${window.location.origin}/e/${eventId}` : '';

    const copyLink = () => {
        if (!eventUrl) return;
        navigator.clipboard.writeText(eventUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadQrCode = () => {
        if (qrCodeRef.current) {
            const svgData = new XMLSerializer().serializeToString(qrCodeRef.current);
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            const img = new Image();
            img.onload = () => {
                canvas.width = img.width + 32; // Add padding
                canvas.height = img.height + 32;
                ctx.fillStyle = "#ffffff"; // White background
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 16, 16); // Draw image with padding

                const pngFile = canvas.toDataURL("image/png");
                const downloadLink = document.createElement("a");
                downloadLink.download = `${eventId}-qrcode.png`;
                downloadLink.href = pngFile;
                downloadLink.click();
            };
            img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
        }
    };

    return (
        <>
            {/* The trigger component on the page remains the same */}
            <div
                onClick={() => setIsOpen(true)}
                className="group flex cursor-pointer flex-col items-center transition-transform hover:scale-105"
            >
                <div className="rounded-lg bg-white p-2">
                    <QRCodeSVG value={eventUrl} size={96} />
                </div>
                <span className="mt-2 text-xs font-mono tracking-tighter text-gray-500 dark:text-zinc-500 group-hover:text-gray-800 dark:group-hover:text-zinc-300">{eventId}</span>
            </div>

            {/* --- REDESIGNED MODAL --- */}
            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsOpen(false)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">

                                {/* BUG FIX: Added `relative` here to contain the absolutely positioned close button */}
                                <Dialog.Panel className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-zinc-900/50 p-6 text-left align-middle shadow-2xl ring-1 ring-white/10 backdrop-blur-xl transition-all">

                                    {/* BUG FIX: The close button is now positioned correctly and won't jump */}
                                    <div className="absolute right-4 top-4">
                                        <button onClick={() => setIsOpen(false)} className="rounded-full p-1.5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white">
                                            <XMarkIcon className="h-6 w-6" />
                                        </button>
                                    </div>

                                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-white">
                                        Share Event
                                    </Dialog.Title>

                                    <div className="mt-6 flex flex-col items-center gap-6">
                                        {/* Glowing QR Code Display */}
                                        <div className="relative">
                                            <div className="absolute inset-[-10px] bg-indigo-500/30 blur-2xl rounded-full"></div>
                                            <div className="relative rounded-xl bg-white p-4">
                                                <QRCodeSVG ref={qrCodeRef} value={eventUrl} size={220} />
                                            </div>
                                        </div>

                                        <p className="w-full truncate rounded-md bg-zinc-800/50 p-2 text-center font-mono text-sm text-zinc-300 ring-1 ring-inset ring-white/10">{eventUrl}</p>

                                        {/* Redesigned Buttons */}
                                        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
                                            <button
                                                onClick={copyLink}
                                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
                                            >
                                                <LinkIcon className="h-5 w-5" />
                                                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                                            </button>
                                            <button
                                                onClick={downloadQrCode}
                                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/5 px-4 py-2.5 text-sm font-medium text-zinc-200 ring-1 ring-inset ring-white/20 transition-colors hover:bg-white/10"
                                            >
                                                <ArrowDownTrayIcon className="h-5 w-5" />
                                                Download
                                            </button>
                                        </div>
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