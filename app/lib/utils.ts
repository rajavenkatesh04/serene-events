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