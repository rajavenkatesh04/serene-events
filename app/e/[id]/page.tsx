'use client';

import { Suspense, useEffect, useState, useRef, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import clsx from 'clsx';
import { db } from '@/app/lib/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { Announcement, Event, FirestoreTimestamp } from '@/app/lib/definitions';
import toast, { Toaster } from 'react-hot-toast';
import {
    CalendarIcon,
    SparklesIcon,
    MapPinIcon,
    PaperClipIcon,
    ArrowDownTrayIcon,
    DocumentTextIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    MagnifyingGlassIcon,
    XMarkIcon,
    EyeIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import LoadingSpinner from "@/app/ui/dashboard/loading-spinner";
import NotificationButton from "@/app/ui/NotificationButton";
import { AnnouncementsFeedSkeleton } from '@/app/ui/skeletons';
import { formatRelativeDate } from '@/app/lib/utils';
import { APIProvider, Map, AdvancedMarker, useMap, InfoWindow } from '@vis.gl/react-google-maps';
import { ScheduledScreen, PausedScreen, EndedScreen, CancelledScreen } from '@/app/e/ui/StatusScreens';
import EventChatPage from "@/app/e/[id]/chat/page";
import EngagePage from "@/app/e/[id]/engage/page";


// =================================================================================
// REUSABLE UI COMPONENTS (Your existing components remain here, unchanged)
// =================================================================================

function StatusBadge({ status }: { status: Event['status'] }) {
    const statusConfig = {
        scheduled: { text: 'Scheduled', style: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' },
        live: { text: 'Live', style: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 animate-pulse' },
        paused: { text: 'Paused', style: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' },
        ended: { text: 'Ended', style: 'bg-gray-200 text-gray-800 dark:bg-zinc-800 dark:text-zinc-400' },
        cancelled: { text: 'Cancelled', style: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' },
    };
    const { text, style } = statusConfig[status] || statusConfig.scheduled;

    return (
        <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${style}`}>
            {status === 'live' && <div className="h-2 w-2 rounded-full bg-green-500"></div>}
            <span>{text}</span>
        </div>
    );
}

function SearchBar({ searchTerm, onSearchChange }: {
    searchTerm: string;
    onSearchChange: (term: string) => void;
}) {
    return (
        <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-zinc-500" />
            </div>
            <input
                type="text"
                placeholder="Search live updates..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-10 pr-10 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:focus:ring-indigo-400"
            />
            {searchTerm && (
                <button
                    onClick={() => onSearchChange('')}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    aria-label="Clear search"
                >
                    <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300" />
                </button>
            )}
        </div>
    );
}

function NavbarForSRM({ searchTerm, onSearchChange }: {
    searchTerm: string;
    onSearchChange: (term: string) => void;
}) {
    const [isMobileSearchVisible, setIsMobileSearchVisible] = useState(false);

    return (
        <nav className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 p-4 text-gray-900 dark:text-zinc-100">
                {!isMobileSearchVisible && (
                    <div className="flex-shrink-0">
                        <Link href="/">
                            <Image
                                src="/9121424.png"
                                alt="SRM Institute of Science and Technology Logo"
                                width={200}
                                height={68}
                                className="h-8 w-auto md:h-10"
                                priority
                            />
                        </Link>
                    </div>
                )}

                <div className="hidden flex-1 items-center justify-end md:flex">
                    <div className="w-full max-w-sm">
                        <SearchBar searchTerm={searchTerm} onSearchChange={onSearchChange} />
                    </div>
                </div>

                <div className="flex w-full items-center justify-end md:hidden">
                    {isMobileSearchVisible ? (
                        <div className="flex w-full items-center gap-2">
                            <SearchBar searchTerm={searchTerm} onSearchChange={onSearchChange} />
                            <button onClick={() => setIsMobileSearchVisible(false)} aria-label="Close search">
                                <XMarkIcon className="h-6 w-6"/>
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => setIsMobileSearchVisible(true)} aria-label="Open search">
                            <MagnifyingGlassIcon className="h-6 w-6" />
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}

function ExpandableText({ text, maxLines = 2 }: { text: string; maxLines?: number }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [canExpand, setCanExpand] = useState(false);
    const textRef = useRef<HTMLParagraphElement | null>(null);

    useEffect(() => {
        if (textRef.current) {
            const element = textRef.current;
            if (element.scrollHeight > element.clientHeight) {
                setCanExpand(true);
            } else {
                setCanExpand(false);
            }
        }
    }, [text, maxLines]);

    return (
        <div>
            <p
                ref={textRef}
                className={`whitespace-pre-wrap break-words text-gray-600 dark:text-zinc-400 ${
                    !isExpanded ? `line-clamp-${maxLines}` : ''
                }`}
            >
                {text}
            </p>
            {canExpand && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                    {isExpanded ? 'Show Less' : 'Show More'}
                </button>
            )}
        </div>
    );
}

function AttachmentCard({ attachment, isCompact = false }: {
    attachment: Announcement['attachment'];
    isCompact?: boolean
}) {
    const [isDownloading, setIsDownloading] = useState(false);

    if (!attachment) return null;

    const isImage = attachment.type.startsWith('image/');
    const isPdf = attachment.type === 'application/pdf';

    const handleDownload = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsDownloading(true);
        const toastId = toast.loading('Starting download...');
        try {
            const response = await fetch(attachment.url);
            if (!response.ok) throw new Error('Network error');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = attachment.name;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success('Download started!', { id: toastId });
        } catch (error) {
            console.error('Download failed:', error);
            toast.error('Download failed.', { id: toastId });
        } finally {
            setIsDownloading(false);
        }
    };

    const handleView = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!attachment?.url) return;
        window.open(attachment.url, '_blank', 'noopener,noreferrer');
    };

    if (isCompact) {
        return (
            <div
                className="mt-3 cursor-pointer rounded-lg border border-gray-200/80 bg-white/50 p-3 hover:bg-white/80 dark:border-zinc-700/50 dark:bg-zinc-800/50 dark:hover:bg-zinc-800/80"
                onClick={handleView}
            >
                <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                        {isImage ? (
                            <Image src={attachment.url} alt={attachment.name} className="h-10 w-10 rounded object-cover" />
                        ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded bg-slate-100 dark:bg-zinc-700">
                                <DocumentTextIcon className="h-5 w-5 text-slate-400 dark:text-zinc-400" />
                            </div>
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-gray-700 dark:text-zinc-300" title={attachment.name}>
                            {attachment.name}
                        </p>
                        <div className="mt-1 flex gap-2">
                            <button
                                onClick={handleDownload}
                                disabled={isDownloading}
                                className="rounded bg-indigo-600 px-2 py-0.5 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
                            >
                                {isDownloading ? '...' : 'Download'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const renderPreview = () => {
        if (isImage) {
            return (
                <img
                    src={attachment.url}
                    alt={attachment.name}
                    className="h-full w-full object-contain"
                />
            );
        }
        const Icon = isPdf ? DocumentTextIcon : PaperClipIcon;
        return (
            <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-zinc-800">
                <Icon className="h-10 w-10 text-slate-400 dark:text-zinc-500" />
            </div>
        );
    };

    return (
        <div className="mt-5 mb-5">
            <div className="rounded-lg border border-gray-200/80 dark:border-zinc-800/50 overflow-hidden">
                <div className="grid grid-cols-3">
                    <div className="col-span-1 bg-slate-100 dark:bg-zinc-900/50">
                        {renderPreview()}
                    </div>
                    <div className="col-span-2 p-4 flex flex-col justify-center">
                        <h4 className="font-semibold text-gray-800 dark:text-zinc-100 flex items-center gap-2">
                            <PaperClipIcon className="h-5 w-5 text-gray-400 dark:text-zinc-500" />
                            <span>Attachment</span>
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-zinc-400 truncate mt-1" title={attachment.name}>
                            {attachment.name}
                        </p>
                        <div className="flex flex-col items-stretch gap-3 mt-4">
                            <button
                                onClick={handleView}
                                className="flex items-center justify-center gap-2 rounded-md bg-white dark:bg-zinc-700 px-3 py-2 text-sm font-medium text-gray-700 dark:text-zinc-200 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-zinc-600 hover:bg-gray-50 dark:hover:bg-zinc-600"
                            >
                                <EyeIcon className="h-4 w-4" />
                                View
                            </button>
                            <button
                                onClick={handleDownload}
                                disabled={isDownloading}
                                className="flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                            >
                                {isDownloading ? (
                                    <div className="flex items-center justify-center">
                                        <LoadingSpinner className="mr-2 h-4 w-4" />
                                        <span>Downloading...</span>
                                    </div>
                                ) : (
                                    <>
                                        <ArrowDownTrayIcon className="h-4 w-4" />
                                        <span>Download</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PinnedCarousel({ announcements }: { announcements: Announcement[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const resetTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % announcements.length);
        }, 5000);
    };

    useEffect(() => {
        if (announcements.length > 1) {
            resetTimer();
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [announcements.length, resetTimer]);

    const handleIndicatorClick = (index: number) => {
        setCurrentIndex(index);
        resetTimer();
    };

    const handlePrevious = () => {
        setCurrentIndex(prev => prev === 0 ? announcements.length - 1 : prev - 1);
        resetTimer();
    };

    const handleNext = () => {
        setCurrentIndex(prev => (prev + 1) % announcements.length);
        resetTimer();
    };

    if (announcements.length === 0) return null;

    return (
        <section className="mb-12" aria-labelledby="pinned-announcements-title">
            <div className="flex items-center justify-between mb-4">
                <h2 id="pinned-announcements-title" className="text-lg font-semibold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
                    <BookmarkSolidIcon className="h-5 w-5 text-amber-500" />
                    Pinned Announcements
                </h2>

                {announcements.length > 1 && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrevious}
                            className="p-2 rounded-full border border-gray-300 bg-white hover:bg-gray-50 dark:border-zinc-600 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                            aria-label="Previous announcement"
                        >
                            <ChevronLeftIcon className="h-4 w-4 text-gray-600 dark:text-zinc-400" />
                        </button>
                        <button
                            onClick={handleNext}
                            className="p-2 rounded-full border border-gray-300 bg-white hover:bg-gray-50 dark:border-zinc-600 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                            aria-label="Next announcement"
                        >
                            <ChevronRightIcon className="h-4 w-4 text-gray-600 dark:text-zinc-400" />
                        </button>
                    </div>
                )}
            </div>

            <div className="overflow-hidden relative">
                <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                    {announcements.map((ann) => (
                        <article
                            key={ann.id}
                            className="flex-shrink-0 w-full rounded-lg border border-amber-500/30 bg-amber-50/30 p-4 dark:border-amber-500/20 dark:bg-amber-950/20"
                            style={{ minHeight: '180px' }}
                        >
                            <div className="flex flex-col h-full">
                                <h3 className="font-semibold text-gray-900 dark:text-zinc-100 line-clamp-2">{ann.title}</h3>
                                <p className="text-sm text-gray-600 dark:text-zinc-400 line-clamp-2 mt-1 flex-grow">{ann.content}</p>
                                {ann.attachment && <AttachmentCard attachment={ann.attachment} isCompact={true} />}
                                <div className="mt-3 text-xs text-gray-400 dark:text-zinc-500">{formatRelativeDate(ann.createdAt)}</div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>

            {announcements.length > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                    {announcements.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => handleIndicatorClick(index)}
                            className={`h-2 w-6 rounded-full transition-colors ${
                                index === currentIndex ? 'bg-amber-500' : 'bg-gray-300 dark:bg-zinc-700'
                            }`}
                            aria-label={`Go to pinned item ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}

function EventHeader({ event, eventId }: { event: Event; eventId: string }) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <header className="mb-8 border-b border-gray-200/80 pb-8 dark:border-zinc-800/50">
            <h1 className="text-4xl font-bold tracking-wide text-transparent bg-gradient-to-r from-blue-500 to-teal-300 bg-clip-text mb-4">
                {event.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 dark:text-zinc-500 mb-4">
                <div className="flex items-center gap-2"><MapPinIcon className="h-4 w-4" /><span>{event.locationText}</span></div>
                <StatusBadge status={event.status}  />

            </div>

            {event.description && (
                <>
                    <div className={`grid transition-all duration-500 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'}`}>
                        <div className="overflow-hidden">
                            <p className="text-gray-600 dark:text-zinc-400 whitespace-pre-wrap mb-6">{event.description}</p>
                            <NotificationButton eventId={eventId} />
                        </div>
                    </div>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="mt-4 flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                        {isExpanded ? (
                            <><span>Show Less</span><ChevronUpIcon className="h-4 w-4" /></>
                        ) : (
                            <><span>Read More & Notify</span><ChevronDownIcon className="h-4 w-4" /></>
                        )}
                    </button>
                </>
            )}
        </header>
    );
}

function AnnouncementMap({ location }: { location: Announcement['location'] }) {
    const map = useMap();
    const [infoWindow, setInfoWindow] = useState<Announcement['location'] | null>(null);
    const [infoWindowPos, setInfoWindowPos] = useState<google.maps.LatLng | null>(null);
    const polygonRef = useRef<google.maps.Polygon | null>(null);

    useEffect(() => {
        if (!map || !location) return;
        if (polygonRef.current) {
            polygonRef.current.setMap(null);
            polygonRef.current = null;
        }
        if (location.type === 'polygon' && location.path) {
            const poly = new google.maps.Polygon({
                paths: location.path,
                fillColor: location.fillColor || '#FF0000',
                fillOpacity: 0.3,
                strokeColor: location.strokeColor || '#FF0000',
                strokeWeight: 2,
            });
            poly.setMap(map);
            polygonRef.current = poly;
            poly.addListener('click', (e: { latLng: google.maps.LatLng }) => {
                setInfoWindowPos(e.latLng);
                setInfoWindow(location);
            });
        }
    }, [map, location]);

    const handleMarkerClick = () => {
        if (location?.center) {
            const latLng = new google.maps.LatLng(location.center.lat, location.center.lng);
            setInfoWindowPos(latLng);
            setInfoWindow(location);
        }
    };

    return (
        <>
            {location?.type === 'pin' && location.center && (
                <AdvancedMarker position={location.center} onClick={handleMarkerClick} />
            )}
            {infoWindow && infoWindowPos && (
                <InfoWindow position={infoWindowPos} onCloseClick={() => setInfoWindow(null)}>
                    <div className="p-2 text-black">
                        <h4 className="font-semibold">{infoWindow.name}</h4>
                        <p className="text-sm">{infoWindow.details}</p>
                    </div>
                </InfoWindow>
            )}
        </>
    );
}

function CompactAnnouncementCard({
                                     announcement,
                                     isRecent,
                                     isExpanded,
                                     onToggleExpanded,
                                     shouldAutoExpand = false
                                 }: {
    announcement: Announcement;
    isRecent: boolean;
    isExpanded: boolean;
    onToggleExpanded: () => void;
    shouldAutoExpand?: boolean;
}) {
    const [showNewBadge, setShowNewBadge] = useState(isRecent);
    const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const googleMapsId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID;

    useEffect(() => {
        if (isRecent) {
            const timer = setTimeout(() => setShowNewBadge(false), 2 * 60 * 1000);
            return () => clearTimeout(timer);
        }
    }, [isRecent]);

    useEffect(() => {
        if (shouldAutoExpand && !isExpanded) {
            onToggleExpanded();
        }
    }, [shouldAutoExpand, isExpanded, onToggleExpanded]);

    if (!isExpanded) {
        return (
            <div
                className={`cursor-pointer rounded-lg border bg-white p-4 shadow-sm hover:shadow-md transition-all duration-300 dark:bg-zinc-900 dark:hover:shadow-lg ${
                    isRecent
                        ? 'border-gradient-animated bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-blue-950/20'
                        : 'border-gray-200/80 dark:border-zinc-800/50'
                }`}
                onClick={onToggleExpanded}
                style={isRecent ? {
                    backgroundImage: 'linear-gradient(45deg, transparent 25%, rgba(59, 130, 246, 0.1) 25%, rgba(59, 130, 246, 0.1) 50%, transparent 50%, transparent 75%, rgba(147, 51, 234, 0.1) 75%)',
                    backgroundSize: '20px 20px',
                    animation: 'gradient-slide 3s linear infinite'
                } : {}}
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            {showNewBadge && (
                                <span className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-2 py-1 text-xs font-medium text-white animate-pulse">
                                    New
                                </span>
                            )}
                            <span className="text-xs text-gray-500 dark:text-zinc-400">{formatRelativeDate(announcement.createdAt)}</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-zinc-100 mb-2 line-clamp-1">{announcement.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-zinc-400 line-clamp-2 mb-3">{announcement.content}</p>
                        <div className="flex items-center gap-4 text-xs">
                            {announcement.attachment && <PaperClipIcon className="h-4 w-4" />}
                            {announcement.location && <MapPinIcon className="h-4 w-4" />}
                        </div>
                    </div>
                    <ChevronDownIcon className="h-5 w-5 text-gray-400 dark:text-zinc-500 flex-shrink-0" />
                </div>
            </div>
        );
    }

    return (
        <article className={`animate-fade-in rounded-lg border bg-white p-5 shadow-sm dark:bg-zinc-900 transition-all duration-300 ${
            isRecent
                ? 'border-gradient-animated'
                : 'border-gray-200/80 dark:border-zinc-800/50'
        }`}>
            <header className="mb-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex flex-wrap items-center gap-3">
                        {announcement.isPinned && (
                            <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                <BookmarkSolidIcon className="h-4 w-4" />
                                <span>Pinned</span>
                            </div>
                        )}
                        {showNewBadge && (
                            <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-2.5 py-1 text-xs font-medium text-white animate-pulse">
                                <span>New</span>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={onToggleExpanded}
                        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800"
                        aria-label="Collapse announcement"
                    >
                        <ChevronUpIcon className="h-5 w-5 text-gray-400 dark:text-zinc-500" />
                    </button>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-100">{announcement.title}</h2>
            </header>

            <div className="mb-5 text-base">
                <ExpandableText text={announcement.content} maxLines={3} />
            </div>

            <AttachmentCard attachment={announcement.attachment} />

            {announcement.location && (
                <div className="mt-5 mb-5">
                    <h4 className="text-sm font-medium text-gray-800 dark:text-zinc-200 flex items-center gap-1.5 mb-2">
                        <MapPinIcon className="h-4 w-4" />
                        {announcement.location.name}
                    </h4>
                    {googleMapsApiKey ? (
                        <div className="h-48 w-full rounded-lg overflow-hidden border dark:border-zinc-800">
                            <APIProvider apiKey={googleMapsApiKey}>
                                <Map
                                    defaultCenter={announcement.location.center}
                                    defaultZoom={18}
                                    gestureHandling={'greedy'}
                                    disableDefaultUI={true}
                                    mapId={googleMapsId}
                                >
                                    <AnnouncementMap location={announcement.location} />
                                </Map>
                            </APIProvider>
                        </div>
                    ) : (
                        <div className="h-48 w-full rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center border border-gray-200 dark:border-zinc-700">
                            <div className="text-center">
                                <MapPinIcon className="h-8 w-8 text-gray-400 dark:text-zinc-500 mx-auto mb-2" />
                                <p className="text-sm text-gray-500 dark:text-zinc-400">Map unavailable</p>
                            </div>
                        </div>
                    )}
                    <a
                        href={`https://maps.google.com/?q=${announcement.location.center.lat},${announcement.location.center.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                        Get Directions
                    </a>
                </div>
            )}

            <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-200/80 pt-4 mt-4 text-sm text-gray-500 dark:border-zinc-800/50 dark:text-zinc-400">
                <div className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    <span>{formatRelativeDate(announcement.createdAt)}</span>
                </div>
            </footer>
        </article>
    );
}

async function getInitialEventData(eventCode: string) {
    try {
        const baseUrl = typeof window !== 'undefined' ? '' : (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
        const response = await fetch(`${baseUrl}/api/events/${eventCode}`);
        if (!response.ok) return null;
        return response.json();
    } catch (error) {
        console.error("Failed to fetch initial event data:", error);
        return null;
    }
}

function normalizeTimestamp(timestamp: unknown): { seconds: number; nanoseconds: number } {
    if (timestamp instanceof Object && 'seconds' in timestamp && typeof timestamp.seconds === 'number') {
        return timestamp as { seconds: number; nanoseconds: number };
    }
    if (timestamp instanceof Object && '_seconds' in timestamp && typeof timestamp._seconds === 'number') {
        const serverTimestamp = timestamp as { _seconds: number; _nanoseconds?: number };
        return { seconds: serverTimestamp._seconds, nanoseconds: serverTimestamp._nanoseconds || 0 };
    }
    if (typeof timestamp === 'string') {
        const date = new Date(timestamp);
        return { seconds: Math.floor(date.getTime() / 1000), nanoseconds: 0 };
    }
    return { seconds: 0, nanoseconds: 0 };
}


// =================================================================================
// MAIN CLIENT COMPONENT WITH TAB LOGIC
// =================================================================================
function EventPageClientUI({ eventId }: { eventId: string }) {
    const searchParams = useSearchParams();
    const activeTab = searchParams.get('tab') || 'announcements';

    const [event, setEvent] = useState<Event | null>(null);
    const [allAnnouncements, setAllAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFeedLoading, setIsFeedLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
    const [latestAnnouncementTime, setLatestAnnouncementTime] = useState<number>(0);

    const liveUpdatesRef = useRef<HTMLDivElement>(null);
    const initialScrollDone = useRef(false);

    useEffect(() => {
        if (!eventId) return;

        let unsubscribe = () => { };

        getInitialEventData(eventId).then(data => {
            if (data && data.eventData && data.eventPath) {
                const rawEvent = data.eventData;
                const correctedEvent = {
                    ...rawEvent,
                    startsAt: normalizeTimestamp(rawEvent.startsAt),
                    endsAt: normalizeTimestamp(rawEvent.endsAt),
                };
                setEvent(correctedEvent);
                setIsLoading(false);

                const announcementsQuery = query(collection(db, `${data.eventPath}/announcements`), orderBy('createdAt', 'desc'));
                unsubscribe = onSnapshot(announcementsQuery, (querySnapshot) => {
                    const announcementsData = querySnapshot.docs.map(doc => {
                        const data = doc.data();
                        return {
                            id: doc.id,
                            ...data,
                            createdAt: normalizeTimestamp(data.createdAt)
                        } as Announcement;
                    });

                    if (announcementsData.length > 0) {
                        const mostRecentTime = Math.max(...announcementsData.map(a => a.createdAt.seconds));
                        if (mostRecentTime > latestAnnouncementTime) {
                            setLatestAnnouncementTime(mostRecentTime);
                        }
                    }
                    setAllAnnouncements(announcementsData);
                    setIsFeedLoading(false);
                }, (err) => {
                    setError("Could not load announcements.");
                    setIsFeedLoading(false);
                });
            } else {
                setError("Event not found.");
                setIsLoading(false);
            }
        }).catch(err => {
            setError("Could not load event.");
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [eventId, latestAnnouncementTime]);

    useEffect(() => {
        if (!isFeedLoading && !initialScrollDone.current && liveUpdatesRef.current) {
            setTimeout(() => {
                liveUpdatesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                initialScrollDone.current = true;
            }, 500);
        }
    }, [isFeedLoading]);

    const pinnedAnnouncements = allAnnouncements.filter(a => a.isPinned);
    const liveAnnouncements = allAnnouncements
        .filter(a => !a.isPinned)
        .filter(a =>
            a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.content.toLowerCase().includes(searchTerm.toLowerCase())
        );

    const isAnnouncementRecent = (announcement: Announcement): boolean => {
        const currentTime = Date.now() / 1000;
        const announcementTime = announcement.createdAt.seconds;
        const isWithinTimeWindow = (currentTime - announcementTime) < (5 * 60);
        const isAmongLatest = announcementTime === latestAnnouncementTime;
        return isWithinTimeWindow && isAmongLatest;
    };

    const handleToggleExpanded = (announcementId: string) => {
        setExpandedCards(prev => {
            const newSet = new Set(prev);
            if (newSet.has(announcementId)) {
                newSet.delete(announcementId);
            } else {
                newSet.add(announcementId);
            }
            return newSet;
        });
    };

    const handleExpandAll = () => {
        const allIds = liveAnnouncements.map(a => a.id);
        setExpandedCards(new Set(allIds));
    };



    const handleCollapseAll = () => {
        setExpandedCards(new Set());
    };

    const isSearchActive = searchTerm.trim().length > 0;

    if (isLoading) {
        return <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-zinc-950"><LoadingSpinner /><span className="ml-2">Loading Event...</span></div>;
    }

    if (error) {
        return <main className="flex min-h-screen flex-col items-center justify-center p-4 text-center"><h1>{error}</h1></main>;
    }

    return (
        <div className="bg-slate-50 text-slate-800 dark:bg-zinc-950 dark:text-slate-200">
            <Toaster position="top-center" reverseOrder={false} />
            <NavbarForSRM searchTerm={searchTerm} onSearchChange={setSearchTerm} />

            <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                {!isSearchActive && event && <EventHeader event={event} eventId={eventId} />}

                <main>
                    {isFeedLoading && !event ? (
                        <AnnouncementsFeedSkeleton />
                    ) : (
                        (() => {
                            if (!event) return null;

                            if (event.status !== 'live') {
                                switch (event.status) {
                                    case 'scheduled': return <ScheduledScreen event={event} />;
                                    case 'paused': return <PausedScreen />;
                                    case 'ended': return <EndedScreen announcements={allAnnouncements} />;
                                    case 'cancelled': return <CancelledScreen />;
                                    default: return null;
                                }
                            }

                            return (
                                <>
                                    <div className="w-full border-b border-gray-200 dark:border-zinc-800">
                                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                                            <Link
                                                href={`/e/${eventId}`}
                                                className={clsx("whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium", {
                                                    'border-indigo-500 text-indigo-600 dark:text-indigo-400': activeTab === 'announcements',
                                                    'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-300': activeTab !== 'announcements'
                                                })}
                                            >
                                                Announcements
                                            </Link>
                                            <Link
                                                href={`/e/${eventId}?tab=chat`}
                                                className={clsx("whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium", {
                                                    'border-indigo-500 text-indigo-600 dark:text-indigo-400': activeTab === 'chat',
                                                    'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-300': activeTab !== 'chat'
                                                })}
                                            >
                                                Chat
                                            </Link>
                                            <Link
                                                href={`/e/${eventId}?tab=engage`}
                                                className={clsx("whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium", {
                                                    'border-indigo-500 text-indigo-600 dark:text-indigo-400': activeTab === 'engage',
                                                    'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-300': activeTab !== 'engage'
                                                })}
                                            >
                                                Engage
                                            </Link>
                                        </nav>
                                    </div>

                                    <div className="py-6">
                                        {activeTab === 'announcements' && (
                                            isFeedLoading ? <AnnouncementsFeedSkeleton /> : (
                                                <>
                                                    {!isSearchActive && <PinnedCarousel announcements={pinnedAnnouncements} />}
                                                    <div ref={liveUpdatesRef} className="scroll-mt-24">
                                                        <div className="flex items-center justify-between mb-6">
                                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
                                                                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                                                                {isSearchActive ? 'Search Results' : 'Live Updates'}
                                                            </h3>
                                                            {!isSearchActive && liveAnnouncements.length > 0 && (
                                                                <div className="flex items-center gap-2">
                                                                    <button onClick={handleExpandAll} className="text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 px-2 py-1 rounded border border-indigo-200 hover:border-indigo-300 dark:border-indigo-800 dark:hover:border-indigo-700">Expand All</button>
                                                                    <button onClick={handleCollapseAll} className="text-xs font-medium text-gray-600 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300 px-2 py-1 rounded border border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600">Collapse All</button>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {liveAnnouncements.length > 0 ? (
                                                            <div className="space-y-4">
                                                                {liveAnnouncements.map((ann, index) => (
                                                                    <CompactAnnouncementCard
                                                                        key={ann.id}
                                                                        announcement={ann}
                                                                        isRecent={isAnnouncementRecent(ann)}
                                                                        isExpanded={expandedCards.has(ann.id)}
                                                                        onToggleExpanded={() => handleToggleExpanded(ann.id)}
                                                                        shouldAutoExpand={index === 0 && isAnnouncementRecent(ann)}
                                                                    />
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="rounded-lg border-2 border-dashed border-gray-300/80 bg-white/50 py-20 text-center dark:border-zinc-800/50 dark:bg-zinc-900/50">
                                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">{searchTerm ? 'No Matching Updates' : 'No Live Updates Yet'}</h3>
                                                                <p className="mt-1 text-gray-500 dark:text-zinc-400">{searchTerm ? 'Try a different search term.' : 'Stay tuned for real-time announcements!'}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </>
                                            )
                                        )}
                                        {activeTab === 'chat' && (
                                            <EventChatPage />
                                        )}
                                        {activeTab === 'engage' && (
                                            <EngagePage />
                                        )}
                                    </div>
                                </>
                            );
                        })()
                    )}
                </main>
            </div>

            <footer className="w-full border-t border-gray-200/80 bg-slate-100/50 py-6 dark:border-zinc-800/50 dark:bg-zinc-950/50">
                <div className="mx-auto flex max-w-6xl items-center justify-center px-6 text-sm text-gray-500 dark:text-zinc-500">
                    <a href="/" target="_blank" rel="noopener noreferrer">
                        <div className="flex items-center gap-2">
                            <SparklesIcon className="h-4 w-4 text-indigo-500" />
                            <span>Powered by <span className="font-medium text-gray-700 dark:text-zinc-300">Luna</span></span>
                        </div>
                    </a>
                </div>
            </footer>

            <style jsx>{`
                @keyframes gradient-slide {
                    0% { background-position: 0% 0%; }
                    100% { background-position: 100% 100%; }
                }
                .border-gradient-animated {
                    border: 2px solid;
                    border-image: linear-gradient(45deg, #3b82f6, #9333ea, #3b82f6) 1;
                    animation: gradient-slide 3s linear infinite;
                }
            `}</style>
        </div>
    );
}

// =================================================================================
// PAGE EXPORT WRAPPED IN SUSPENSE
// =================================================================================
export default function PublicEventPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-zinc-950"><LoadingSpinner /><span className="ml-2">Loading Event...</span></div>}>
            <EventPageClientUI eventId={resolvedParams.id} />
        </Suspense>
    );
}