import { FirestoreTimestamp } from '@/app/lib/definitions';

/**
 * Safely serializes various timestamp formats into a plain object
 * that can be passed from Server to Client Components.
 * @param timestamp The value to serialize, can be a Firestore Timestamp, a Date object, or null.
 * @returns A plain object with seconds and nanoseconds, or null.
 */
export const serializeTimestamp = (timestamp: unknown): FirestoreTimestamp | null => {
    // FIX: Changed 'any' to 'unknown' for better type safety.

    if (!timestamp) {
        return null;
    }

    // Handle Firestore Admin SDK Timestamps which have _seconds
    if (timestamp instanceof Object && '_seconds' in timestamp && typeof timestamp._seconds === 'number') {
        const ts = timestamp as { _seconds: number; _nanoseconds?: number };
        return {
            seconds: ts._seconds,
            nanoseconds: ts._nanoseconds || 0,
        };
    }

    // Handle already serialized objects or client-side Timestamps
    if (timestamp instanceof Object && 'seconds' in timestamp && typeof timestamp.seconds === 'number') {
        return timestamp as FirestoreTimestamp;
    }

    // Handle JavaScript Date objects
    if (timestamp instanceof Date) {
        return {
            seconds: Math.floor(timestamp.getTime() / 1000),
            nanoseconds: (timestamp.getTime() % 1000) * 1000000,
        };
    }

    console.warn("serializeTimestamp received an unrecognized timestamp format:", timestamp);
    return null;
};

export const generatePagination = (currentPage: number, totalPages: number) => {
    // If the total number of pages is 7 or less,
    // display all pages without any ellipsis.
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // If the current page is among the first 3 pages,
    // show the first 3, an ellipsis, and the last 2 pages.
    if (currentPage <= 3) {
        return [1, 2, 3, '...', totalPages - 1, totalPages];
    }

    // If the current page is among the last 3 pages,
    // show the first 2, an ellipsis, and the last 3 pages.
    if (currentPage >= totalPages - 2) {
        return [1, 2, '...', totalPages - 2, totalPages - 1, totalPages];
    }

    // If the current page is somewhere in the middle,
    // show the first page, an ellipsis, the current page and its neighbors,
    // another ellipsis, and the last page.
    return [
        1,
        '...',
        currentPage - 1,
        currentPage,
        currentPage + 1,
        '...',
        totalPages,
    ];
};

export function formatRelativeDate(timestamp: { seconds: number; nanoseconds: number; } | undefined | null): string {
    if (!timestamp) return '';

    const date = new Date(timestamp.seconds * 1000);
    const now = new Date();

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);

    // Using `undefined` lets the browser use the user's local format.
    const timeFormatter = new Intl.DateTimeFormat(undefined, { timeStyle: 'short' });

    if (date >= startOfToday) {
        return `Today at ${timeFormatter.format(date)}`;
    } else if (date >= startOfYesterday) {
        return `Yesterday at ${timeFormatter.format(date)}`;
    } else {
        const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'long' });
        return dateFormatter.format(date);
    }
}



/**
 * Formats a start and end timestamp into a user-friendly, timezone-aware string.
 * @param startsAt The event's start timestamp.
 * @param endsAt The event's end timestamp.
 * @returns A formatted string like "Oct 7, 9:00 AM - 5:00 PM PDT".
 */
export function formatEventTimeRange(
    startsAt: FirestoreTimestamp | null | undefined,
    endsAt: FirestoreTimestamp | null | undefined
): string {
    if (!startsAt || !endsAt) return 'Time not specified';

    const startDate = new Date(startsAt.seconds * 1000);
    const endDate = new Date(endsAt.seconds * 1000);

    const options: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short', // Crucial for showing timezone context e.g., PST, EDT
    };

    // Check if the event is on the same day in the user's local timezone
    const isSameDay = startDate.toLocaleDateString() === endDate.toLocaleDateString();

    if (isSameDay) {
        // e.g., "Oct 7, 9:00 AM - 5:00 PM PDT"
        return `${startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}, ${startDate.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })} - ${endDate.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' })}`;
    } else {
        // e.g., "Oct 6, 10:00 PM PDT - Oct 7, 6:00 AM PDT"
        return `${startDate.toLocaleString(undefined, options)} - ${endDate.toLocaleString(undefined, options)}`;
    }
}