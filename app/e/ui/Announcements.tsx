'use client';

import { useState, useEffect, useRef } from 'react';
import { Announcement } from '@/app/lib/definitions';
import { AnnouncementsFeedSkeleton } from '@/app/ui/skeletons';
import { formatRelativeDate } from '@/app/lib/utils';
import toast from 'react-hot-toast';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import {
    MapPinIcon, PaperClipIcon, ArrowDownTrayIcon, DocumentTextIcon, ChevronDownIcon,
    ChevronUpIcon, MagnifyingGlassIcon, XMarkIcon, EyeIcon, ChevronLeftIcon, ChevronRightIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import LoadingSpinner from "@/app/ui/dashboard/loading-spinner";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// --- HELPER COMPONENTS ---

function SearchBar({ searchTerm, onSearchChange }: { searchTerm: string; onSearchChange: (term: string) => void; }) {
    return (
        <div className="relative w-full max-w-xs">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-zinc-500" />
            </div>
            <input
                type="text"
                placeholder="Search updates..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-10 pr-10 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            />
            {searchTerm && (
                <button onClick={() => onSearchChange('')} className="absolute inset-y-0 right-0 flex items-center pr-3" aria-label="Clear search">
                    <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300" />
                </button>
            )}
        </div>
    );
}

function AttachmentCard({ attachment, isCompact = false }: {
    attachment: Announcement['attachment'];
    isCompact?: boolean;
}) {
    const [isDownloading, setIsDownloading] = useState(false);
    if (!attachment) return null;

    const isImage = attachment.type.startsWith('image/');

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
            a.href = url;
            a.download = attachment.name;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success('Download complete!', { id: toastId });
        } catch (error) {
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
                            <img src={attachment.url} alt={attachment.name} className="h-10 w-10 rounded object-cover" />
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

    return (
        <div className="mt-4">
            <div className="overflow-hidden rounded-lg border border-gray-200/80 dark:border-zinc-700/50">
                <div className="grid grid-cols-1 sm:grid-cols-3">
                    <div className="flex h-32 items-center justify-center bg-slate-50 dark:bg-zinc-800/50 sm:col-span-1 sm:h-auto">
                        {attachment.type.startsWith('image/') ? (
                            <img src={attachment.url} alt={attachment.name} className="h-full w-full object-cover" />
                        ) : (
                            <DocumentTextIcon className="h-10 w-10 text-slate-400 dark:text-zinc-500" />
                        )}
                    </div>
                    <div className="flex flex-col justify-center p-4 sm:col-span-2">
                        <p className="font-semibold text-gray-800 dark:text-zinc-200 truncate" title={attachment.name}>{attachment.name}</p>
                        <div className="mt-4 flex flex-col items-stretch gap-2">
                            <button onClick={handleView} className="flex items-center justify-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-zinc-700/50 dark:text-zinc-200 dark:ring-zinc-600 dark:hover:bg-zinc-700">
                                <EyeIcon className="h-4 w-4" /> View
                            </button>
                            <button onClick={handleDownload} disabled={isDownloading} className="flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50">
                                {isDownloading ? <LoadingSpinner className="h-4 w-4" /> : <ArrowDownTrayIcon className="h-4 w-4" />}
                                Download
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AnnouncementMap({ location }: { location: Announcement['location'] }) {
    const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const googleMapsId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID;
    if (!location || !googleMapsApiKey) return null;

    return (
        <div className="mt-4">
            <h4 className="flex items-center gap-1.5 mb-2 text-sm font-semibold text-gray-800 dark:text-zinc-200">
                <MapPinIcon className="h-4 w-4 text-gray-400 dark:text-zinc-500" />{location.name}
            </h4>
            <div className="h-48 w-full overflow-hidden rounded-lg border dark:border-zinc-800">
                <APIProvider apiKey={googleMapsApiKey}>
                    <Map defaultCenter={location.center} defaultZoom={15} gestureHandling={'greedy'} disableDefaultUI={true} mapId={googleMapsId}>
                        <AdvancedMarker position={location.center} />
                    </Map>
                </APIProvider>
            </div>
            <a href={`https://www.google.com/maps/search/?api=1&query=${location.center.lat},${location.center.lng}`}
               target="_blank" rel="noopener noreferrer"
               className="mt-2 inline-block text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                Get Directions →
            </a>
        </div>
    );
}

export function CompactAnnouncementCard({ announcement, isRecent, isExpanded, onToggleExpanded }: { announcement: Announcement; isRecent: boolean; isExpanded: boolean; onToggleExpanded: () => void; }) {
    const [showNewBadge, setShowNewBadge] = useState(isRecent);

    useEffect(() => {
        setShowNewBadge(isRecent);
        if (isRecent) {
            const timer = setTimeout(() => setShowNewBadge(false), 5 * 60 * 1000);
            return () => clearTimeout(timer);
        }
    }, [isRecent]);

    if (!isExpanded) {
        return (
            <div
                className={`relative cursor-pointer rounded-xl border p-4 shadow-sm transition-all duration-300 hover:shadow-md dark:hover:border-zinc-700/80 ${
                    isRecent ? 'border-indigo-500/50 bg-indigo-50/10 dark:bg-indigo-950/20' : 'border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
                }`}
                onClick={onToggleExpanded}
            >
                {isRecent && <div className="absolute -left-1 -top-1 h-3 w-3 rounded-full bg-indigo-500 animate-pulse"></div>}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            {showNewBadge && <span className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">New</span>}
                            <span className="text-xs text-gray-500 dark:text-zinc-400">{formatRelativeDate(announcement.createdAt)}</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-zinc-100 line-clamp-2">{announcement.title}</h3>
                        <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-zinc-500 mt-2">
                            {announcement.attachment && <PaperClipIcon className="h-4 w-4" title="Has attachment" />}
                            {announcement.location && <MapPinIcon className="h-4 w-4" title="Has location" />}
                        </div>
                    </div>
                    <ChevronDownIcon className="h-5 w-5 text-gray-400 dark:text-zinc-500 flex-shrink-0" />
                </div>
            </div>
        );
    }

    return (
        <article className={`relative animate-fade-in rounded-xl border p-5 shadow-lg transition-all duration-300 ${
            isRecent ? 'border-indigo-500/50 bg-indigo-50/10 dark:bg-indigo-950/20' : 'border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
        }`}>
            {isRecent && <div className="absolute -left-1 -top-1 h-3 w-3 rounded-full bg-indigo-500 animate-pulse"></div>}
            <header className="flex items-start justify-between mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        {showNewBadge && <span className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">New</span>}
                        <span className="text-xs text-gray-500 dark:text-zinc-400">{formatRelativeDate(announcement.createdAt)}</span>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-100">{announcement.title}</h2>
                </div>
                <button onClick={onToggleExpanded} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800" aria-label="Collapse announcement">
                    <ChevronUpIcon className="h-5 w-5" />
                </button>
            </header>
            <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-zinc-300">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {announcement.content}
                </ReactMarkdown>
            </div>
            <AttachmentCard attachment={announcement.attachment} />
            <AnnouncementMap location={announcement.location} />
        </article>
    );
}

// --- NEW STYLED PinnedCarousel COMPONENT ---
function PinnedCarousel({ announcements }: { announcements: Announcement[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const resetTimer = () => {
        if (announcements.length <= 1) return;
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % announcements.length);
        }, 5000);
    };

    useEffect(() => {
        resetTimer();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [announcements.length]);

    const handleIndicatorClick = (index: number) => {
        setCurrentIndex(index);
        resetTimer();
    };

    const handlePrevious = () => {
        setCurrentIndex(prev => (prev - 1 + announcements.length) % announcements.length);
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

// --- MAIN ANNOUNCEMENTS COMPONENT ---

export default function Announcements({ announcements, isLoading }: { announcements: Announcement[]; isLoading: boolean; }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
    const [latestAnnouncementTime, setLatestAnnouncementTime] = useState(0);

    useEffect(() => {
        if (announcements.length > 0) {
            const mostRecentTime = Math.max(...announcements.map(a => a.createdAt?.seconds || 0));
            if (mostRecentTime > latestAnnouncementTime) {
                setLatestAnnouncementTime(mostRecentTime);
                const newestAnn = announcements.find(a => a.createdAt?.seconds === mostRecentTime);
                if (newestAnn) {
                    setExpandedCards(new Set([newestAnn.id]));
                }
            } else if (expandedCards.size === 0 && latestAnnouncementTime === 0 && !isLoading) {
                setLatestAnnouncementTime(mostRecentTime);
                const newestAnn = announcements.find(a => a.createdAt?.seconds === mostRecentTime);
                if (newestAnn) {
                    setExpandedCards(new Set([newestAnn.id]));
                }
            }
        }
    }, [announcements, isLoading, latestAnnouncementTime]);

    const isAnnouncementRecent = (announcement: Announcement): boolean => {
        if (!announcement.createdAt) return false;
        return announcement.createdAt.seconds === latestAnnouncementTime && (Date.now() / 1000 - announcement.createdAt.seconds) < 300;
    };

    const handleToggleExpanded = (announcementId: string) => {
        setExpandedCards(prev => {
            const newSet = new Set(prev);
            newSet.has(announcementId) ? newSet.delete(announcementId) : newSet.add(announcementId);
            return newSet;
        });
    };

    const liveAnnouncements = announcements.filter(a => !a.isPinned).filter(a =>
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleExpandAll = () => setExpandedCards(new Set(liveAnnouncements.map(a => a.id)));
    const handleCollapseAll = () => setExpandedCards(new Set());
    const pinnedAnnouncements = announcements.filter(a => a.isPinned);

    if (isLoading) return <AnnouncementsFeedSkeleton />;

    return (
        <>
            <PinnedCarousel announcements={pinnedAnnouncements} />
            <div className="scroll-mt-24">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
                        <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div> Live Updates
                    </h3>
                    <div className="flex w-full sm:w-auto items-center justify-end gap-2">
                        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
                        {liveAnnouncements.length > 1 && !searchTerm && (
                            <>
                                <button onClick={handleExpandAll} title="Expand All" className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800"><ArrowsPointingOutIcon className="h-5 w-5" /></button>
                                <button onClick={handleCollapseAll} title="Collapse All" className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800"><ArrowsPointingInIcon className="h-5 w-5" /></button>
                            </>
                        )}
                    </div>
                </div>
                {liveAnnouncements.length > 0 ? (
                    <div className="space-y-4">
                        {liveAnnouncements.map((ann) => (
                            <CompactAnnouncementCard
                                key={ann.id}
                                announcement={ann}
                                isRecent={isAnnouncementRecent(ann)}
                                isExpanded={expandedCards.has(ann.id)}
                                onToggleExpanded={() => handleToggleExpanded(ann.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-lg border-2 border-dashed border-gray-300/80 bg-white/50 py-20 text-center dark:border-zinc-800/50 dark:bg-zinc-900/50">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">{searchTerm ? 'No Matching Updates' : 'No Live Updates Yet'}</h3>
                        <p className="mt-1 text-gray-500 dark:text-zinc-400">{searchTerm ? 'Try a different search term.' : 'Stay tuned for real-time announcements!'}
                        </p>
                    </div>
                )}
            </div>

            <style jsx global>{`
                .border-indigo-500\\/50 {
                    animation: pulse-border 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                @keyframes pulse-border {
                    0%, 100% { border-color: rgba(99, 102, 241, 0.3); }
                    50% { border-color: rgba(99, 102, 241, 0.7); }
                }
            `}</style>
        </>
    );
}
