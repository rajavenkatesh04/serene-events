'use client';

import { useState, useRef, Fragment } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, LinkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export default function InteractiveQrCode({ eventId }: { eventId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const qrCodeRef = useRef<SVGSVGElement>(null);

    // This now safely accesses window.location.origin only when the component mounts on the client
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
                canvas.width = img.width + 32; // Add padding for margin
                canvas.height = img.height + 32;
                ctx.fillStyle = "#ffffff"; // Set background to white
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
            {/* The small QR code displayed on the "pass" */}
            <div
                onClick={() => setIsOpen(true)}
                className="group flex cursor-pointer flex-col items-center transition-transform hover:scale-105"
            >
                <div className="rounded-lg bg-white p-2">
                    <QRCodeSVG value={eventUrl} size={96} />
                </div>
                <span className="mt-2 text-xs font-mono tracking-tighter text-gray-500 dark:text-zinc-500 group-hover:text-gray-800 dark:group-hover:text-zinc-300">{eventId}</span>
            </div>

            {/* The modal that pops up */}
            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsOpen(false)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-zinc-900">
                                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-zinc-100">
                                        Event QR Code
                                    </Dialog.Title>
                                    <button onClick={() => setIsOpen(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200">
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                    <div className="mt-4 flex flex-col items-center gap-4">
                                        <div className="rounded-xl bg-white p-4">
                                            {/* Note: This QR code for the modal uses a ref for downloading */}
                                            <QRCodeSVG ref={qrCodeRef} value={eventUrl} size={256} />
                                        </div>
                                        <p className="w-full truncate rounded-md bg-gray-100 p-2 text-center font-mono text-sm text-gray-700 dark:bg-zinc-800 dark:text-zinc-300">{eventUrl}</p>
                                        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
                                            <button onClick={copyLink} className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:ring-offset-zinc-900">
                                                <LinkIcon className="h-4 w-4" />
                                                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                                            </button>
                                            <button onClick={downloadQrCode} className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700">
                                                <ArrowDownTrayIcon className="h-4 w-4" />
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