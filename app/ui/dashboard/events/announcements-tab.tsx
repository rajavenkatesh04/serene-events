'use client';

import { useActionState, useEffect, useState, useRef, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { createAnnouncement, CreateAnnouncementState, deleteAnnouncement } from '@/app/lib/actions/eventActions';
import { db, storage } from '@/app/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { Announcement } from '@/app/lib/definitions';
import {
    UserCircleIcon,
    CalendarIcon,
    TrashIcon,
    MapPinIcon,
    PaperClipIcon,
    ArrowDownTrayIcon,
    EyeIcon,
    XCircleIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon } from '@heroicons/react/24/solid';
import LoadingSpinner from "@/app/ui/dashboard/loading-spinner";
import { AnnouncementsTabSkeleton } from '@/app/ui/skeletons';
import MapLocationModal from './map-location-modal';
import { APIProvider, Map, AdvancedMarker, useMap, InfoWindow } from '@vis.gl/react-google-maps';

// --- Sub-components ---

function SubmitButton({ isUploading }: { isUploading: boolean }) {
    const { pending } = useFormStatus();
    const isDisabled = pending || isUploading;
    return (
        <button
            type="submit"
            disabled={isDisabled}
            className="flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400 md:w-auto"
            aria-disabled={isDisabled}
        >
            {isUploading ? <><LoadingSpinner className="mr-2" /><span>Uploading...</span></> : (pending ? <><LoadingSpinner className="mr-2" /><span>Sending...</span></> : <span>Send Announcement</span>)}
        </button>
    );
}

function AttachmentButton({ onClick }: { onClick: () => void }) {
    return (
        <button type="button" onClick={onClick} className="flex items-center gap-2 rounded-md p-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800">
            <PaperClipIcon className="h-5 w-5" />
            <span>Attach File</span>
        </button>
    );
}

function DeleteButton() {
    const { pending } = useFormStatus();
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (!confirm('Are you sure you want to delete this announcement? This will also delete any attachments.')) {
            event.preventDefault();
        }
    };
    return (
        <button type="submit" onClick={handleClick} disabled={pending} aria-disabled={pending} className="p-1 text-gray-400 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-500 dark:hover:text-red-500">
            {pending ? <LoadingSpinner className="h-4 w-4" /> : <TrashIcon className="h-5 w-5" />}
        </button>
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

            poly.addListener('click', (e: google.maps.PolyMouseEvent) => {
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

function AttachmentPreviewModal({ attachment, onClose }: { attachment: Announcement['attachment']; onClose: () => void; }) {
    if (!attachment) return null;

    const isImage = attachment.type.startsWith('image/');
    const isPdf = attachment.type === 'application/pdf';

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="relative flex flex-col w-full h-full max-w-4xl max-h-[90vh] bg-white dark:bg-zinc-900 rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-700">
                    <h3 className="font-semibold text-lg text-gray-800 dark:text-zinc-100 truncate pr-4">{attachment.name}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                        <XCircleIcon className="h-7 w-7" />
                    </button>
                </header>
                <main className="flex-grow overflow-auto">
                    {isImage ? (
                        <div className="flex items-center justify-center w-full h-full p-4">
                            <img src={attachment.url} alt={attachment.name} className="max-w-full max-h-full object-contain" />
                        </div>
                    ) : isPdf ? (
                        <iframe src={attachment.url} className="w-full h-full" title={attachment.name} />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                            <DocumentTextIcon className="h-20 w-20 text-gray-400 dark:text-zinc-500 mb-4" />
                            <p className="text-lg font-medium text-gray-700 dark:text-zinc-200">Preview is not available.</p>
                            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">You can download the file to view it.</p>
                            <a href={attachment.url} download={attachment.name} className="mt-6 inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700">
                                <ArrowDownTrayIcon className="h-5 w-5" />
                                Download File
                            </a>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

// --- Main AnnouncementsTab Component ---
export default function AnnouncementsTab({ eventId, orgId }: { eventId: string, orgId: string }) {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const formRef = useRef<HTMLFormElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const initialState: CreateAnnouncementState = { message: null, errors: {} };
    const [state, dispatch] = useActionState(createAnnouncement, initialState);
    const [isTransitioning, startTransition] = useTransition();
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<Announcement['location'] | null>(null);
    const [fileToUpload, setFileToUpload] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [attachmentToPreview, setAttachmentToPreview] = useState<Announcement['attachment'] | null>(null);

    const handleFormSubmit = (formData: FormData) => {
        if (fileToUpload) {
            setIsUploading(true);
            const filePath = `events/${eventId}/attachments/${Date.now()}_${fileToUpload.name}`;
            const storageRef = ref(storage, filePath);
            const uploadTask = uploadBytesResumable(storageRef, fileToUpload);

            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadProgress(progress);
                },
                (error) => {
                    console.error("Upload failed:", error);
                    setIsUploading(false);
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        const attachmentData = {
                            url: downloadURL,
                            path: filePath,
                            name: fileToUpload.name,
                            type: fileToUpload.type,
                        };
                        formData.append('attachment', JSON.stringify(attachmentData));
                        startTransition(() => {
                            dispatch(formData);
                        });
                    });
                }
            );
        } else {
            startTransition(() => {
                dispatch(formData);
            });
        }
    };

    useEffect(() => {
        const q = query(
            collection(db, `organizations/${orgId}/events/${eventId}/announcements`),
            orderBy('createdAt', 'desc')
        );
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const announcementsData = querySnapshot.docs.map(doc => ({...doc.data(), id: doc.id } as Announcement));
            announcementsData.sort((a, b) => {
                if (a.isPinned && !b.isPinned) return -1;
                if (!a.isPinned && b.isPinned) return 1;
                const dateA = a.createdAt?.seconds ? a.createdAt.seconds : 0;
                const dateB = b.createdAt?.seconds ? b.createdAt.seconds : 0;
                return dateB - dateA;
            });
            setAnnouncements(announcementsData);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [eventId, orgId]);

    useEffect(() => {
        if (state.message?.startsWith('Successfully')) {
            formRef.current?.reset();
            setSelectedLocation(null);
            setFileToUpload(null);
            setUploadProgress(0);
            setIsUploading(false);
            if(fileInputRef.current) fileInputRef.current.value = "";
        }
    }, [state]);

    if (isLoading) return <AnnouncementsTabSkeleton />;

    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
            <div>
                <form action={handleFormSubmit} ref={formRef} className="rounded-lg border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                    <h3 className="mb-2 font-semibold tracking-wide text-gray-900 dark:text-zinc-100">Create New Announcement</h3>
                    <input type="hidden" name="eventId" value={eventId} />
                    <div className="mb-2">
                        <input name="title" id="title" required placeholder="Announcement Title" className="block w-full rounded-md border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500" />
                    </div>
                    <div className="mb-4">
                        <textarea name="content" id="content" required rows={3} placeholder="Write your update here..." className="block w-full rounded-md border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"></textarea>
                    </div>

                    {selectedLocation && <input type="hidden" name="location" value={JSON.stringify(selectedLocation)} />}
                    <input type="file" ref={fileInputRef} onChange={(e) => setFileToUpload(e.target.files ? e.target.files[0] : null)} className="hidden" />

                    <div className='space-y-4 mb-4'>
                        {selectedLocation && (
                            <div className="text-sm text-gray-600 dark:text-zinc-400 font-medium bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-md px-3 py-2">
                                📍 Location Added: <span className='text-gray-800 dark:text-zinc-200'>{selectedLocation.name}</span>
                            </div>
                        )}

                        {fileToUpload && (
                            <div className="rounded-md border border-gray-200 bg-gray-50 p-3 dark:border-zinc-700 dark:bg-zinc-800">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-700 dark:text-zinc-300 truncate">{fileToUpload.name}</p>
                                    <button type="button" onClick={() => { setFileToUpload(null); if(fileInputRef.current) fileInputRef.current.value = ""; }} className="p-1 text-gray-400 hover:text-red-500">
                                        <XCircleIcon className="h-5 w-5" />
                                    </button>
                                </div>
                                {isUploading && uploadProgress > 0 && uploadProgress < 100 && (
                                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2 dark:bg-zinc-700">
                                        <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col-reverse items-stretch gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-2">
                            <label htmlFor="isPinned" className="flex cursor-pointer items-center rounded-md p-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800">
                                <input type="checkbox" id="isPinned" name="isPinned" className="sr-only peer" />
                                <BookmarkIcon className="h-5 w-5 peer-checked:text-amber-500 peer-checked:fill-amber-500" />
                                <span className="ml-2">Pin</span>
                            </label>
                            <button type="button" onClick={() => setIsMapModalOpen(true)} className="flex items-center gap-2 rounded-md p-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800">
                                <MapPinIcon className="h-5 w-5" />
                                <span>{selectedLocation ? "Edit Location" : "Add Location"}</span>
                            </button>
                            <AttachmentButton onClick={() => fileInputRef.current?.click()} />
                        </div>
                        <SubmitButton isUploading={isUploading} />
                    </div>
                </form>

                <MapLocationModal isOpen={isMapModalOpen} onClose={() => setIsMapModalOpen(false)} onSave={(loc) => setSelectedLocation(loc)} />

                {attachmentToPreview && (
                    <AttachmentPreviewModal
                        attachment={attachmentToPreview}
                        onClose={() => setAttachmentToPreview(null)}
                    />
                )}

                <div className="mt-8">
                    <h3 className="mb-4 font-semibold text-gray-900 dark:text-zinc-100">Posted Announcements</h3>
                    {announcements.length > 0 ? (
                        <ul className="space-y-4">
                            {announcements.map((ann) => (
                                <li key={ann.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 pr-4">
                                            <div className="flex items-center gap-2">
                                                {ann.isPinned && <BookmarkIcon className="h-5 w-5 text-amber-500" title="Pinned Announcement" />}
                                                <h3 className="font-semibold text-gray-900 dark:text-zinc-100">{ann.title}</h3>
                                            </div>
                                            <p className="mt-1 whitespace-pre-wrap break-words text-sm text-gray-600 dark:text-zinc-300">{ann.content}</p>
                                        </div>
                                        <form action={deleteAnnouncement}>
                                            <input type="hidden" name="eventId" value={eventId} />
                                            <input type="hidden" name="announcementId" value={ann.id} />
                                            <DeleteButton />
                                        </form>
                                    </div>

                                    {ann.attachment && (
                                        <div className="mt-4">
                                            <div className="flex items-center gap-3 rounded-md border border-gray-200 bg-gray-50 p-3 dark:border-zinc-700 dark:bg-zinc-800">
                                                <PaperClipIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
                                                <span className="text-sm font-medium text-gray-800 dark:text-zinc-200 truncate flex-1">{ann.attachment.name}</span>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <button
                                                        type="button"
                                                        onClick={() => setAttachmentToPreview(ann.attachment)}
                                                        className="p-1 text-gray-500 hover:text-blue-600"
                                                        aria-label="Preview attachment"
                                                    >
                                                        <EyeIcon className="h-5 w-5" />
                                                    </button>
                                                    <a href={ann.attachment.url} download={ann.attachment.name} className="p-1 text-gray-500 hover:text-blue-600" aria-label="Download attachment">
                                                        <ArrowDownTrayIcon className="h-5 w-5" />
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {ann.location && (
                                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-zinc-800">
                                            <h4 className="text-sm font-medium text-gray-800 dark:text-zinc-200 flex items-center gap-1"><MapPinIcon className="h-4 w-4" />{ann.location.name}</h4>
                                            <div className="mt-2 h-48 w-full rounded-lg overflow-hidden">
                                                <Map
                                                    defaultCenter={ann.location.center}
                                                    defaultZoom={16}
                                                    gestureHandling={'greedy'}
                                                    disableDefaultUI={true}
                                                    mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID!}
                                                >
                                                    <AnnouncementMap location={ann.location} />
                                                </Map>
                                            </div>
                                            <a
                                                href={`https://www.google.com/maps/dir/?api=1&destination=$${ann.location.center.lat},${ann.location.center.lng}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-2 inline-block text-xs font-semibold text-blue-600 hover:underline"
                                            >
                                                Get Directions
                                            </a>
                                        </div>
                                    )}

                                    <div className="mt-3 flex items-center justify-between gap-4 border-t border-gray-200 pt-3 text-xs text-gray-500 dark:border-zinc-800 dark:text-zinc-400">
                                        <span className="flex items-center gap-1.5 font-medium"><UserCircleIcon className="w-4 h-4" /> {ann.authorName}</span>
                                        {ann.createdAt?.seconds && (
                                            <span className="flex items-center gap-1.5"><CalendarIcon className="w-4 h-4" />
                                                {new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(ann.createdAt.seconds * 1000))}
                                            </span>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="rounded-lg border border-dashed border-gray-300 bg-white py-12 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <p className="text-gray-500 dark:text-zinc-400">No announcements have been sent for this event yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </APIProvider>
    );
}