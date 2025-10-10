// File: app/e/ui/LocationAccordion.tsx
'use client';

import { Disclosure } from '@headlessui/react';
import { ChevronUpIcon, MapPinIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/solid';
import { AnimatePresence, motion } from 'framer-motion';
import { Location } from './locations';
import Image from 'next/image';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

function LocationItem({ location }: { location: Location }) {
    const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${location.latitude},${location.longitude}&zoom=18.5&size=600x300&maptype=roadmap&markers=color:red%7Clabel:P%7C${location.latitude},${location.longitude}&key=${GOOGLE_MAPS_API_KEY}`;

    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`;

    return (
        <div className="border-t border-gray-200/80 px-4 py-5 dark:border-zinc-800/50">
            <h4 className="text-base font-semibold text-gray-800 dark:text-zinc-200">{location.title}</h4>
            <div className="mt-1 flex items-start gap-1.5 text-sm text-gray-500 dark:text-zinc-400">
                <MapPinIcon className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{location.details}</span>
            </div>

            <div className="mt-4 overflow-hidden rounded-lg ring-1 ring-black/5">
                <a href={location.mapUrl} target="_blank" rel="noopener noreferrer" className="block">
                    <Image
                        src={staticMapUrl}
                        alt={`Map of ${location.title}`}
                        width={600}
                        height={300}
                        className="transition-transform duration-300 hover:scale-105"
                    />
                </a>
            </div>
            <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
                Get Directions
                <ArrowTopRightOnSquareIcon className="h-4 w-4" />
            </a>
        </div>
    );
}

export default function LocationAccordion({ locationsByCategory }: {
    locationsByCategory: Record<string, Location[]>
}) {
    if (!GOOGLE_MAPS_API_KEY) {
        return (
            <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-center dark:border-red-800 dark:bg-red-950/20">
                <p className="font-bold text-red-800 dark:text-red-300">Configuration Error</p>
                <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                    A Google Maps API key has not been provided in the environment variables.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-3">
            {Object.entries(locationsByCategory).map(([category, locations]) => (
                <Disclosure key={category} as="div" className="rounded-xl bg-white shadow-sm ring-1 ring-black/5 dark:bg-zinc-900 dark:ring-white/10">
                    {({ open }) => (
                        <>
                            <Disclosure.Button className={`sticky top-[73px] z-30 flex w-full justify-between rounded-t-xl bg-white px-4 py-4 text-left text-lg font-medium text-gray-900 hover:bg-gray-50/50 focus:outline-none focus-visible:ring focus-visible:ring-indigo-500/75 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800/50 ${open ? 'shadow-md' : ''}`}>
                                <span>{category}</span>
                                <ChevronUpIcon
                                    className={`${open ? 'rotate-180' : ''} h-6 w-6 text-gray-500 transition-transform duration-300 dark:text-zinc-400`}
                                />
                            </Disclosure.Button>
                            <AnimatePresence>
                                {open && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                        className="overflow-hidden"
                                    >
                                        <Disclosure.Panel static className="max-h-[600px] overflow-y-auto">
                                            {locations.map(location => <LocationItem key={location.id} location={location} />)}
                                        </Disclosure.Panel>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </>
                    )}
                </Disclosure>
            ))}
        </div>
    );
}